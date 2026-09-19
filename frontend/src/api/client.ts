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
  GetScoresResponse,
  StoredQuizScore
} from './types';
import {
  INITIAL_TOPICS,
  INITIAL_QUESTIONS,
  INITIAL_WEAK_TOPICS,
  INITIAL_COVERAGE_GAPS,
  INITIAL_WEIGHTED_TOPICS
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = localStorage.getItem('panicdesk_auth_token');
  }

  setAuthToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('panicdesk_auth_token', token);
    } else {
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
    if (!this.baseUrl) {
      throw new Error('NO_BACKEND_CONFIGURED');
    }

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
      } catch (_) {}
      throw new Error(errMessage);
    }

    return response.json();
  }

  async getUploadUrl(fileName: string, contentType: string): Promise<UploadUrlResponse> {
    if (this.baseUrl) {
      return this.request<UploadUrlResponse>('/upload-url', {
        method: 'POST',
        body: JSON.stringify({ file_name: fileName, content_type: contentType })
      });
    }
    const mockKey = `uploads/session_${Date.now()}/${encodeURIComponent(fileName)}`;
    return {
      status: 'success',
      upload_url: '',
      s3_key: mockKey
    };
  }

  async uploadFileToS3(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const uploadMeta = await this.getUploadUrl(file.name, file.type || 'application/pdf');

    if (uploadMeta.upload_url) {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadMeta.upload_url, true);
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(Math.round((event.loaded / event.total) * 100));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`S3 upload failed with status ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('S3 upload network error'));
        xhr.send(file);
      });
      return uploadMeta.s3_key;
    }

    for (let p = 20; p <= 100; p += 20) {
      if (onProgress) onProgress(p);
      await new Promise((r) => setTimeout(r, 60));
    }
    return uploadMeta.s3_key;
  }

  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    if (this.baseUrl) {
      return this.request<SummarizeResponse>('/summarize', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    }
    await new Promise((r) => setTimeout(r, 900));
    return {
      status: 'success',
      topics: [
        ...INITIAL_TOPICS,
        {
          topic_id: `t_${Date.now()}`,
          name: `Synthesized Module (${request.s3_key.split('/').pop() || 'Notes'})`,
          summary: `Bedrock OCR extraction complete. High yield correlation detected for thermodynamics and computational equilibria.`
        }
      ]
    };
  }

  async generateQuiz(request: GenerateQuizRequest): Promise<GenerateQuizResponse> {
    if (this.baseUrl) {
      return this.request<GenerateQuizResponse>('/generate-quiz', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    }
    await new Promise((r) => setTimeout(r, 800));
    return {
      status: 'success',
      questions: INITIAL_QUESTIONS
    };
  }

  async getWeakTopics(request: WeakTopicsRequest): Promise<WeakTopicsResponse> {
    if (this.baseUrl) {
      return this.request<WeakTopicsResponse>('/weak-topics', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    }
    await new Promise((r) => setTimeout(r, 600));
    const missed = request.answers.filter((a) => !a.correct);
    const weakList = missed.map((m) => {
      const matched = request.topics?.find((t) => t.topic_id === m.topic_id);
      return {
        topic_id: m.topic_id,
        name: matched ? matched.name : `Topic ${m.topic_id}`,
        reason: `Missed question ${m.question_id} on recall drill`,
        severity: 'high' as const
      };
    });
    return {
      status: 'success',
      weak_topics: weakList.length > 0 ? weakList : INITIAL_WEAK_TOPICS
    };
  }

  async getCoverageGaps(request: CoverageGapsRequest): Promise<CoverageGapsResponse> {
    if (this.baseUrl) {
      return this.request<CoverageGapsResponse>('/coverage-gaps', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    }
    await new Promise((r) => setTimeout(r, 800));
    return {
      status: 'success',
      gaps: INITIAL_COVERAGE_GAPS
    };
  }

  async getPastPaperWeighting(request: PastPaperWeightingRequest): Promise<PastPaperWeightingResponse> {
    if (this.baseUrl) {
      return this.request<PastPaperWeightingResponse>('/past-paper-weighting', {
        method: 'POST',
        body: JSON.stringify(request)
      });
    }
    await new Promise((r) => setTimeout(r, 800));
    return {
      status: 'success',
      weighted_topics: INITIAL_WEIGHTED_TOPICS
    };
  }

  async listFiles(): Promise<ListFilesResponse> {
    if (this.baseUrl) {
      return this.request<ListFilesResponse>('/list-files', {
        method: 'GET'
      });
    }
    return {
      status: 'success',
      files: []
    };
  }

  async getDownloadUrl(s3Key: string): Promise<DownloadUrlResponse> {
    if (this.baseUrl) {
      return this.request<DownloadUrlResponse>('/download-url', {
        method: 'POST',
        body: JSON.stringify({ s3_key: s3Key })
      });
    }
    return {
      status: 'success',
      download_url: ''
    };
  }

  async getScores(limit = 20): Promise<GetScoresResponse> {
    if (this.baseUrl) {
      return this.request<GetScoresResponse>('/get-scores', {
        method: 'POST',
        body: JSON.stringify({ limit })
      });
    }
    return {
      status: 'success',
      scores: []
    };
  }
}

export const api = new ApiClient(API_BASE_URL);
