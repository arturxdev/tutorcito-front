export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  question: string;
  answers: Answer[];
  difficulty: Difficulty;
  correctAnswerId: string;
}

export interface QuizConfig {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface GeneratedQuiz {
  id: string;
  pdfName: string;
  questions: Question[];
  createdAt: string;
  config: QuizConfig;
  examId?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  questions: Question[];
  answers: Record<string, string>;
  score: number;
  totalQuestions: number;
  completedAt: string | null;
  startedAt: string;
  djangoAttemptId?: number;
}

export interface FeedbackState {
  isVisible: boolean;
  isCorrect: boolean;
  selectedAnswerId: string;
  correctAnswerId: string;
  questionId: string;
}

export interface QuizState {
  currentQuiz: GeneratedQuiz | null;
  currentAttempt: QuizAttempt | null;
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  isLoading: boolean;
  error: string | null;
  feedbackState: FeedbackState | null;
}

export interface ScoreBreakdown {
  score: number;
  total: number;
  percentage: number;
  byDifficulty: Record<Difficulty, { correct: number; total: number }>;
}

export interface CreateAttemptRequest {
  score: number;
  total_questions: number;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string;
}

export interface DjangoAttemptResponse {
  id: number;
  exam: number;
  user: number;
  score: number;
  total_questions: number;
  answers: Record<string, unknown>;
  started_at: string;
  completed_at: string;
  created_at: string;
}
