import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  TopicSummary,
  QuizQuestion,
  WeakTopic,
  CoverageGap,
  WeightedTopic,
  UserProfile,
  FileItem,
  StoredQuizScore
} from '../api/types';
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
  user: UserProfile | null;
  loginWithGoogle: (credential: string, customProfile?: Partial<UserProfile>) => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  topics: TopicSummary[];
  questions: QuizQuestion[];
  quizAnswers: Record<string, number>;
  quizSubmitted: boolean;
  quizScore: { correct: number; total: number } | null;
  weakTopics: WeakTopic[];
  coverageGaps: CoverageGap[];
  weightedTopics: WeightedTopic[];
  uploadedFiles: UploadedFileRecord[];
  scoreHistory: StoredQuizScore[];

  isLoading: boolean;
  loadingStep: string;
  error: string | null;
  clearError: () => void;

  handleUploadNotes: (file: File) => Promise<void>;
  handleLoadQuiz: () => Promise<void>;
  handleAnswerQuestion: (questionId: string, optionIndex: number) => void;
  handleSubmitQuiz: () => Promise<void>;
  handleResetQuiz: () => void;
  handleUploadSyllabus: (file: File) => Promise<void>;
  handleUploadPastPapers: (files: File[]) => Promise<void>;
  refreshFiles: () => Promise<void>;
  refreshScores: () => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

function decodeJwtPayload(token: string): Partial<UserProfile> {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      sub: parsed.sub || 'user_' + Date.now(),
      email: parsed.email || 'student@university.edu',
      name: parsed.name || 'Candidate Scholar',
      picture: parsed.picture
    };
  } catch (_) {
    return {
      sub: 'user_' + Date.now(),
      email: 'student@university.edu',
      name: 'Candidate Scholar'
    };
  }
}

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const [topics, setTopics] = useState<TopicSummary[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [coverageGaps, setCoverageGaps] = useState<CoverageGap[]>([]);
  const [weightedTopics, setWeightedTopics] = useState<WeightedTopic[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileRecord[]>([]);
  const [scoreHistory, setScoreHistory] = useState<StoredQuizScore[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

  const loginWithGoogle = (credential: string, customProfile?: Partial<UserProfile>) => {
    const decoded = decodeJwtPayload(credential);
    const profile: UserProfile = {
      sub: customProfile?.sub || decoded.sub || 'user_' + Date.now(),
      email: customProfile?.email || decoded.email || 'scholar@university.edu',
      name: customProfile?.name || decoded.name || 'Candidate Scholar',
      picture: customProfile?.picture || decoded.picture,
      token: credential
    };
    api.setAuthToken(credential);
    setUser(profile);
    setIsLoggedIn(true);
    localStorage.setItem('panicdesk_user', JSON.stringify(profile));
    setCurrentView('overview');
    refreshFiles();
    refreshScores();
  };

  const logout = () => {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (_) {}
    }
    api.setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('panicdesk_user');
    setCurrentView('login');
  };

  const refreshFiles = async () => {
    try {
      const res = await api.listFiles();
      if (res.status === 'success' && res.files && res.files.length > 0) {
        const mapped: UploadedFileRecord[] = res.files.map((f: FileItem) => ({
          id: f.s3_key,
          name: f.file_name,
          s3_key: f.s3_key,
          type: 'notes',
          uploadedAt: new Date(f.last_modified).toLocaleDateString(),
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          status: 'ready'
        }));
        setUploadedFiles(mapped);
      }
    } catch (_) {}
  };

  const refreshScores = async () => {
    try {
      const res = await api.getScores(20);
      if (res.status === 'success' && res.scores) {
        setScoreHistory(res.scores);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshFiles();
      refreshScores();
    }
  }, [isLoggedIn]);

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
      await new Promise((r) => setTimeout(r, 600));

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

      const weakRes = await api.getWeakTopics({
        answers: submissionList,
        topics: topics.map((t) => ({ topic_id: t.topic_id, name: t.name }))
      });
      if (weakRes.status === 'success') {
        setWeakTopics(weakRes.weak_topics);
      }
      await refreshScores();
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
        user,
        loginWithGoogle,
        logout,
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
        scoreHistory,
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
        handleUploadPastPapers,
        refreshFiles,
        refreshScores
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
