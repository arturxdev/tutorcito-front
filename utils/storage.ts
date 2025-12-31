import { GeneratedQuiz, QuizAttempt } from '@/types/quiz';

const STORAGE_KEYS = {
  GENERATED_QUIZZES: 'tutorcito_quizzes',
  QUIZ_ATTEMPTS: 'tutorcito_attempts',
  CURRENT_ATTEMPT: 'tutorcito_current_attempt',
} as const;

/**
 * LocalStorage manager for quiz data
 */
export const StorageManager = {
  // Quiz operations
  saveQuiz(quiz: GeneratedQuiz): void {
    if (typeof window === 'undefined') return;
    try {
      const quizzes = this.getAllQuizzes();
      quizzes.push(quiz);
      localStorage.setItem(STORAGE_KEYS.GENERATED_QUIZZES, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  },

  getAllQuizzes(): GeneratedQuiz[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GENERATED_QUIZZES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return [];
    }
  },

  getQuizById(id: string): GeneratedQuiz | null {
    const quizzes = this.getAllQuizzes();
    return quizzes.find(q => q.id === id) || null;
  },

  deleteQuiz(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const quizzes = this.getAllQuizzes().filter(q => q.id !== id);
      localStorage.setItem(STORAGE_KEYS.GENERATED_QUIZZES, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  },

  // Attempt operations
  saveAttempt(attempt: QuizAttempt): void {
    if (typeof window === 'undefined') return;
    try {
      const attempts = this.getAllAttempts();
      attempts.push(attempt);
      localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error saving attempt:', error);
    }
  },

  getAllAttempts(): QuizAttempt[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting attempts:', error);
      return [];
    }
  },

  getAttemptsByQuizId(quizId: string): QuizAttempt[] {
    return this.getAllAttempts().filter(a => a.quizId === quizId);
  },

  // Current attempt operations
  getCurrentAttempt(): QuizAttempt | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_ATTEMPT);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current attempt:', error);
      return null;
    }
  },

  setCurrentAttempt(attempt: QuizAttempt | null): void {
    if (typeof window === 'undefined') return;
    try {
      if (attempt) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_ATTEMPT, JSON.stringify(attempt));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_ATTEMPT);
      }
    } catch (error) {
      console.error('Error setting current attempt:', error);
    }
  },

  clearCurrentAttempt(): void {
    this.setCurrentAttempt(null);
  },

  // Utility
  clearAll(): void {
    if (typeof window === 'undefined') return;
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};
