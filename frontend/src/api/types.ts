// API Contract Types matching API_CONTRACT.md

// Generic Status
export type ApiStatus = 'success' | 'error';

export interface ApiErrorResponse {
  status: 'error';
  message: string;
}

// 3.1 summarize
export type FileType = 'pdf' | 'image' | 'text';

export interface SummarizeRequest {
  s3_key: string;
  file_type: FileType;
}

export interface TopicSummary {
  topic_id: string;
  name: string;
  summary: string;
}

export interface SummarizeResponse {
  status: 'success';
  topics: TopicSummary[];
}

// 3.2 generate_quiz
export interface GenerateQuizRequest {
  topics: TopicSummary[];
  weighted_topics?: WeightedTopic[];
}

export interface QuizQuestion {
  id: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
}

export interface GenerateQuizResponse {
  status: 'success';
  questions: QuizQuestion[];
}

// 3.3 weak_topics
export interface QuizAnswerSubmission {
  question_id: string;
  topic_id: string;
  correct: boolean;
}

export interface WeakTopicsRequest {
  answers: QuizAnswerSubmission[];
}

export type Severity = 'high' | 'medium' | 'low';

export interface WeakTopic {
  topic_id: string;
  name: string;
  reason: string;
  severity: Severity;
}

export interface WeakTopicsResponse {
  status: 'success';
  weak_topics: WeakTopic[];
}

// 3.4 coverage_gaps
export interface CoverageGapsRequest {
  syllabus_s3_key: string;
  topics: TopicSummary[];
}

export interface CoverageGap {
  name: string;
  reason: string;
}

export interface CoverageGapsResponse {
  status: 'success';
  gaps: CoverageGap[];
}

// 3.5 past_paper_weighting
export interface PastPaperWeightingRequest {
  s3_keys: string[];
}

export interface WeightedTopic {
  topic_id: string;
  name: string;
  frequency: number;
  years_seen: string[];
  weight: 'high' | 'medium' | 'low';
}

export interface PastPaperWeightingResponse {
  status: 'success';
  weighted_topics: WeightedTopic[];
}

// Upload URL contract (from lambdas/upload_url)
export interface UploadUrlRequest {
  file_name: string;
  content_type: string;
}

export interface UploadUrlResponse {
  status: 'success';
  upload_url: string;
  s3_key: string;
}
