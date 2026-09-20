import {
  SummarizeRequest,
  SummarizeResponse,
  GenerateQuizRequest,
  GenerateQuizResponse,
  WeakTopicsRequest,
  WeakTopicsResponse,
  CoverageGapsRequest,
  CoverageGapsResponse,
  PastPaperWeightingRequest,
  PastPaperWeightingResponse,
  UploadUrlResponse,
  DownloadUrlResponse,
  ListFilesResponse,
  GetScoresResponse
} from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = localStorage.getItem('panicdeck_auth_token') || localStorage.getItem('panicdesk_auth_token');
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('panicdeck_auth_token', token);
    } else {
      localStorage.removeItem('panicdeck_auth_token');
      localStorage.removeItem('panicdesk_auth_token');
    }
  }

  getAuthToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  private async request<TRes>(path: string, options: RequestInit): Promise<TRes> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      let errMessage = `HTTP error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errMessage = errorJson.message;
        else if (errorJson.detail) errMessage = typeof errorJson.detail === 'string' ? errorJson.detail : JSON.stringify(errorJson.detail);
      } catch (_) {}
      throw new Error(errMessage);
    }

    return response.json();
  }

  async getUploadUrl(fileName: string, contentType: string): Promise<UploadUrlResponse> {
    return this.request<UploadUrlResponse>('/upload-url', {
      method: 'POST',
      body: JSON.stringify({ file_name: fileName, content_type: contentType })
    });
  }

  async uploadFileToS3(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const contentType = file.type || 'application/pdf';
    const uploadMeta = await this.getUploadUrl(file.name, contentType);

    if (uploadMeta.upload_url) {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadMeta.upload_url, true);
        xhr.setRequestHeader('Content-Type', contentType);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`File upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('File upload network error'));
        xhr.send(file);
      });
      return uploadMeta.s3_key;
    }

    throw new Error('Failed to obtain upload URL from backend');
  }

  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    return this.request<SummarizeResponse>('/summarize', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async generateQuiz(request: GenerateQuizRequest): Promise<GenerateQuizResponse> {
    return this.request<GenerateQuizResponse>('/generate-quiz', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getWeakTopics(request: WeakTopicsRequest): Promise<WeakTopicsResponse> {
    return this.request<WeakTopicsResponse>('/weak-topics', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getCoverageGaps(request: CoverageGapsRequest): Promise<CoverageGapsResponse> {
    return this.request<CoverageGapsResponse>('/coverage-gaps', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async getPastPaperWeighting(request: PastPaperWeightingRequest): Promise<PastPaperWeightingResponse> {
    return this.request<PastPaperWeightingResponse>('/past-paper-weighting', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  }

  async listFiles(): Promise<ListFilesResponse> {
    return this.request<ListFilesResponse>('/list-files', {
      method: 'GET'
    });
  }

  async getDownloadUrl(s3Key: string): Promise<DownloadUrlResponse> {
    return this.request<DownloadUrlResponse>('/download-url', {
      method: 'POST',
      body: JSON.stringify({ s3_key: s3Key })
    });
  }

  async getScores(limit = 20): Promise<GetScoresResponse> {
    return this.request<GetScoresResponse>('/get-scores', {
      method: 'POST',
      body: JSON.stringify({ limit })
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
