// API Contract Types matching API_CONTRACT.md and Lambda Handlers

export type ApiStatus = 'success' | 'error';

export interface ApiErrorResponse {
  status: 'error';
  message: string;
}

// User Profile for Google OAuth / Institutional Authentication
export interface UserProfile {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  token: string;
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
  topics?: Array<{ topic_id: string; name: string }>;
}

export type Severity = 'high' | 'medium' | 'low';

export interface WeakTopic {
  topic_id: string;
  name: string;
  reason: string;
  severity: Severity;
}

export interface QuizScoreSummary {
  total_questions: number;
  correct_count: number;
  overall_accuracy: number;
}

export interface TopicAccuracyBreakdown {
  topic_id: string;
  name: string;
  total: number;
  correct: number;
  accuracy: number;
}

export interface WeakTopicsResponse {
  status: 'success';
  quiz_id?: string;
  score?: QuizScoreSummary;
  topic_breakdown?: TopicAccuracyBreakdown[];
  weak_topics: WeakTopic[];
}

// DynamoDB Stored Quiz Score Item (lambdas/get_scores)
export interface StoredQuizScore {
  user_id: string;
  timestamp_quiz_id: string;
  quiz_id: string;
  total_questions: number;
  correct_count: number;
  overall_accuracy: number;
  topic_breakdown?: TopicAccuracyBreakdown[];
  weak_topics?: WeakTopic[];
  created_at: string;
}

export interface GetScoresResponse {
  status: 'success';
  scores: StoredQuizScore[];
}

// 3.4 coverage_gaps
export interface CoverageGapsRequest {
  syllabus_s3_key: string;
  topics: TopicSummary[];
  subject_code?: string;
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

// Presigned Upload URL (lambdas/upload_url)
export interface UploadUrlRequest {
  file_name: string;
  content_type: string;
}

export interface UploadUrlResponse {
  status: 'success';
  upload_url: string;
  s3_key: string;
}

// Presigned Download URL (lambdas/download_url)
export interface DownloadUrlRequest {
  s3_key: string;
}

export interface DownloadUrlResponse {
  status: 'success';
  download_url: string;
}

// List Files (lambdas/list_files)
export interface FileItem {
  s3_key: string;
  file_name: string;
  size: number;
  last_modified: string;
}

export interface ListFilesResponse {
  status: 'success';
  files: FileItem[];
}
