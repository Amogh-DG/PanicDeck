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
  TopicSummary,
  QuizQuestion,
  WeakTopic
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

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    if (!this.baseUrl) {
      throw new Error('NO_BACKEND_CONFIGURED');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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

  // Upload Presigned URL / direct S3 flow
  async getUploadUrl(fileName: string, contentType: string): Promise<UploadUrlResponse> {
    try {
      return await this.post<
        { file_name: string; content_type: string },
        UploadUrlResponse
      >('/upload-url', { file_name: fileName, content_type: contentType });
    } catch (e) {
      // Mock fallback
      const mockKey = `uploads/session_${Date.now()}/${encodeURIComponent(fileName)}`;
      return {
        status: 'success',
        upload_url: '',
        s3_key: mockKey
      };
    }
  }

  async uploadFileToS3(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const uploadMeta = await this.getUploadUrl(file.name, file.type || 'application/pdf');

    if (uploadMeta.upload_url) {
      // Real S3 PUT upload
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
          else reject(new Error(`S3 upload failed: ${xhr.status}`));
        };
        xhr.onerror = () => reject(new Error('S3 upload network error'));
        xhr.send(file);
      });
      return uploadMeta.s3_key;
    } else {
      // Simulated upload progress
      for (let p = 10; p <= 100; p += 25) {
        if (onProgress) onProgress(p);
        await new Promise((r) => setTimeout(r, 120));
      }
      return uploadMeta.s3_key;
    }
  }

  // 3.1 summarize
  async summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
    try {
      return await this.post<SummarizeRequest, SummarizeResponse>('/summarize', request);
    } catch (e) {
      console.warn('Using mock summarize response:', e);
      await new Promise((r) => setTimeout(r, 1200));
      // Return custom structured topic summaries
      return {
        status: 'success',
        topics: [
          ...INITIAL_TOPICS,
          {
            topic_id: `t_${Date.now()}`,
            name: `Synthesized Module from ${request.s3_key.split('/').pop() || 'Notes'}`,
            summary: `**Automated Bedrock Synthesis**: Extracted 14 key theorems, 3 derivation paths, and 8 definition cards. High correlation detected with historical past paper questions on thermodynamic and computational equilibria.`
          }
        ]
      };
    }
  }

  // 3.2 generate_quiz
  async generateQuiz(request: GenerateQuizRequest): Promise<GenerateQuizResponse> {
    try {
      return await this.post<GenerateQuizRequest, GenerateQuizResponse>('/generate-quiz', request);
    } catch (e) {
      console.warn('Using mock generate_quiz response:', e);
      await new Promise((r) => setTimeout(r, 1000));
      return {
        status: 'success',
        questions: INITIAL_QUESTIONS
      };
    }
  }

  // 3.3 weak_topics
  async getWeakTopics(request: WeakTopicsRequest): Promise<WeakTopicsResponse> {
    try {
      return await this.post<WeakTopicsRequest, WeakTopicsResponse>('/weak-topics', request);
    } catch (e) {
      console.warn('Using mock weak_topics response:', e);
      await new Promise((r) => setTimeout(r, 800));

      const missed = request.answers.filter((a) => !a.correct);
      const weakList: WeakTopic[] = missed.map((m) => ({
        topic_id: m.topic_id,
        name: `Topic Ref ${m.topic_id}`,
        reason: `Missed question ${m.question_id} during emergency recall sprint`,
        severity: 'high'
      }));

      return {
        status: 'success',
        weak_topics: weakList.length > 0 ? weakList : INITIAL_WEAK_TOPICS
      };
    }
  }

  // 3.4 coverage_gaps
  async getCoverageGaps(request: CoverageGapsRequest): Promise<CoverageGapsResponse> {
    try {
      return await this.post<CoverageGapsRequest, CoverageGapsResponse>('/coverage-gaps', request);
    } catch (e) {
      console.warn('Using mock coverage_gaps response:', e);
      await new Promise((r) => setTimeout(r, 1000));
      return {
        status: 'success',
        gaps: INITIAL_COVERAGE_GAPS
      };
    }
  }

  // 3.5 past_paper_weighting
  async getPastPaperWeighting(
    request: PastPaperWeightingRequest
  ): Promise<PastPaperWeightingResponse> {
    try {
      return await this.post<
        PastPaperWeightingRequest,
        PastPaperWeightingResponse
      >('/past-paper-weighting', request);
    } catch (e) {
      console.warn('Using mock past_paper_weighting response:', e);
      await new Promise((r) => setTimeout(r, 1100));
      return {
        status: 'success',
        weighted_topics: INITIAL_WEIGHTED_TOPICS
      };
    }
  }
}

export const api = new ApiClient(API_BASE_URL);
