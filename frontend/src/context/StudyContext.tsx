import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TopicSummary,
  QuizQuestion,
  WeakTopic,
  CoverageGap,
  WeightedTopic
} from '../api/types';
import {
  INITIAL_TOPICS,
  INITIAL_QUESTIONS,
  INITIAL_WEAK_TOPICS,
  INITIAL_COVERAGE_GAPS,
  INITIAL_WEIGHTED_TOPICS
} from '../api/mockData';
import { api } from '../api/client';

export type ViewType =
  | 'landing'
  | 'login'
  | 'overview'
  | 'notes'
  | 'quizzes'
  | 'weak_topics'
  | 'coverage'
  | 'past_papers';

export interface UploadedFileRecord {
  id: string;
  name: string;
  s3_key: string;
  type: 'notes' | 'syllabus' | 'past_paper';
  uploadedAt: string;
  size: string;
  status: 'processing' | 'ready' | 'error';
}

interface StudyContextType {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Data state
  topics: TopicSummary[];
  questions: QuizQuestion[];
  quizAnswers: Record<string, number>;
  quizSubmitted: boolean;
  quizScore: { correct: number; total: number } | null;
  weakTopics: WeakTopic[];
  coverageGaps: CoverageGap[];
  weightedTopics: WeightedTopic[];
  uploadedFiles: UploadedFileRecord[];

  // Progress / async state
  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  clearError: () => void;

  // Actions
  handleUploadNotes: (file: File) => Promise<void>;
  handleLoadQuiz: () => Promise<void>;
  handleAnswerQuestion: (questionId: string, optionIndex: number) => void;
  handleSubmitQuiz: () => Promise<void>;
  handleResetQuiz: () => void;
  handleUploadSyllabus: (file: File) => Promise<void>;
  handleUploadPastPapers: (files: File[]) => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [topics, setTopics] = useState<TopicSummary[]>(INITIAL_TOPICS);
  const [questions, setQuestions] = useState<QuizQuestion[]>(INITIAL_QUESTIONS);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>(INITIAL_WEAK_TOPICS);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>(INITIAL_COVERAGE_GAPS);
  const [weightedTopics, setWeightedTopics] = useState<WeightedTopic[]>(INITIAL_WEIGHTED_TOPICS);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord[]>([
    {
      id: 'f1',
      name: 'Advanced_Organic_Chemistry_Vol2.pdf',
      s3_key: 'uploads/session_01/Advanced_Organic_Chemistry_Vol2.pdf',
      type: 'notes',
      uploadedAt: '42m ago',
      size: '3.4 MB',
      status: 'ready'
    },
    {
      id: 'f2',
      name: 'Microeconomic_Theory_Equilibrium.pdf',
      s3_key: 'uploads/session_01/Microeconomic_Theory_Equilibrium.pdf',
      type: 'notes',
      uploadedAt: '2h ago',
      size: '2.1 MB',
      status: 'ready'
    },
    {
      id: 'f3',
      name: 'CS204_OS_Virtual_Memory_Paging.pdf',
      s3_key: 'uploads/session_01/CS204_OS_Virtual_Memory_Paging.pdf',
      type: 'notes',
      uploadedAt: 'Yesterday',
      size: '4.1 MB',
      status: 'ready'
    }
  ]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync theme with DOM document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const clearError = () => setError(null);

  // 1. Upload & Summarize Notes Flow
  const handleUploadNotes = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingStep('Uploading document to S3 vault...');
      const s3_key = await api.uploadFileToS3(file);

      const newRecord: UploadedFileRecord = {
        id: `f_${Date.now()}`,
        name: file.name,
        s3_key,
        type: 'notes',
        uploadedAt: 'Just now',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'processing'
      };
      setUploadedFiles((prev) => [newRecord, ...prev]);

      setLoadingStep('Extracting OCR & text streams via Bedrock AI...');
      await new Promise((r) => setTimeout(r, 800));

      setLoadingStep('Synthesizing structured topic summaries...');
      const ext = file.name.split('.').pop()?.toLowerCase();
      const fileType = ext === 'pdf' ? 'pdf' : ext === 'txt' ? 'text' : 'image';

      const res = await api.summarize({ s3_key, file_type: fileType });
      if (res.status === 'success') {
        setTopics(res.topics);
        setUploadedFiles((prev) =>
          prev.map((item) =>
            item.id === newRecord.id ? { ...item, status: 'ready' } : item
          )
        );
      }
    } catch (e: any) {
      setError(e.message || 'Failed to process notes');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 2. Generate Quiz
  const handleLoadQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingStep('Weighting questions by past paper frequencies...');
      const res = await api.generateQuiz({
        topics,
        weighted_topics: weightedTopics
      });
      if (res.status === 'success') {
        setQuestions(res.questions);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleAnswerQuestion = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // 3. Submit Quiz & Compute Weak Topics
  const handleSubmitQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingStep('Grading recall responses & ranking weak topics...');
      let correctCount = 0;
      const submissionList = questions.map((q) => {
        const selected = quizAnswers[q.id];
        const isCorrect = selected === q.correct_answer_index;
        if (isCorrect) correctCount++;
        return {
          question_id: q.id,
          topic_id: q.topic_id,
          correct: isCorrect
        };
      });

      setQuizScore({ correct: correctCount, total: questions.length });
      setQuizSubmitted(true);

      const weakRes = await api.getWeakTopics({ answers: submissionList });
      if (weakRes.status === 'success') {
        setWeakTopics(weakRes.weak_topics);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to submit quiz');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // 4. Syllabus Upload & Audit
  const handleUploadSyllabus = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingStep('Ingesting official syllabus document...');
      const s3_key = await api.uploadFileToS3(file);

      setLoadingStep('Auditing syllabus requirements against uploaded notes...');
      const res = await api.getCoverageGaps({
        syllabus_s3_key: s3_key,
        topics
      });
      if (res.status === 'success') {
        setCoverageGaps(res.gaps);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to audit syllabus gaps');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // 5. Past Papers Upload & Weighting
  const handleUploadPastPapers = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingStep(`Uploading ${files.length} past-paper folios...`);
      const s3Keys: string[] = [];
      for (const f of files) {
        const key = await api.uploadFileToS3(f);
        s3Keys.push(key);
      }

      setLoadingStep('Scanning historical exam questions (2018–2024)...');
      const res = await api.getPastPaperWeighting({ s3_keys: s3Keys });
      if (res.status === 'success') {
        setWeightedTopics(res.weighted_topics);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to analyze past papers');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <StudyContext.Provider
      value={{
        currentView,
        setCurrentView,
        isLoggedIn,
        setIsLoggedIn,
        theme,
        toggleTheme,
        topics,
        questions,
        quizAnswers,
        quizSubmitted,
        quizScore,
        weakTopics,
        coverageGaps,
        weightedTopics,
        uploadedFiles,
        isLoading,
        loadingStep,
        error,
        clearError,
        handleUploadNotes,
        handleLoadQuiz,
        handleAnswerQuestion,
        handleSubmitQuiz,
        handleResetQuiz,
        handleUploadSyllabus,
        handleUploadPastPapers
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
