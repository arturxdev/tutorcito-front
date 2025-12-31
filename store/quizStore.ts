import { create } from 'zustand';
import { nanoid } from 'nanoid';
import {
  GeneratedQuiz,
  QuizAttempt,
  QuizConfig,
  QuizState,
  FeedbackState,
} from '@/types/quiz';
import { StorageManager } from '@/utils/storage';
import { selectRandomQuestions } from '@/utils/random';

interface QuizStore extends QuizState {
  // Actions
  setQuiz: (quiz: GeneratedQuiz) => void;
  startAttempt: (config: QuizConfig) => void;
  selectAnswer: (questionId: string, answerId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  finishAttempt: () => void;
  resetQuiz: () => void;
  loadFromStorage: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // Feedback actions
  showFeedback: (questionId: string, selectedId: string, correctId: string) => void;
  clearFeedback: () => void;
}

const initialState: QuizState = {
  currentQuiz: null,
  currentAttempt: null,
  currentQuestionIndex: 0,
  selectedAnswers: {},
  isLoading: false,
  error: null,
  feedbackState: null,
};

export const useQuizStore = create<QuizStore>((set, get) => ({
  ...initialState,

  setQuiz: (quiz: GeneratedQuiz) => {
    console.log('💾 [Store] Guardando quiz con config:', quiz.config);
    set({ currentQuiz: quiz, error: null });
    StorageManager.saveQuiz(quiz);
  },

  startAttempt: (config: QuizConfig) => {
    const { currentQuiz } = get();
    if (!currentQuiz) {
      set({ error: 'No quiz loaded' });
      return;
    }

    console.log('🚀 [Store] Iniciando intento con config:', config);
    console.log('📚 [Store] Preguntas disponibles en el quiz:', currentQuiz.questions.length);

    // Select random questions based on config
    const selectedQuestions = selectRandomQuestions(currentQuiz.questions, config);

    console.log('✅ [Store] Preguntas seleccionadas:', selectedQuestions.length);
    console.log('📋 [Store] Distribución:', {
      easy: selectedQuestions.filter(q => q.difficulty === 'easy').length,
      medium: selectedQuestions.filter(q => q.difficulty === 'medium').length,
      hard: selectedQuestions.filter(q => q.difficulty === 'hard').length,
    });

    const attempt: QuizAttempt = {
      id: nanoid(),
      quizId: currentQuiz.id,
      questions: selectedQuestions,
      answers: {},
      score: 0,
      totalQuestions: selectedQuestions.length,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    set({
      currentAttempt: attempt,
      currentQuestionIndex: 0,
      selectedAnswers: {},
      error: null,
    });

    StorageManager.setCurrentAttempt(attempt);
  },

  selectAnswer: (questionId: string, answerId: string) => {
    const { selectedAnswers, currentAttempt } = get();

    const newAnswers = {
      ...selectedAnswers,
      [questionId]: answerId,
    };

    set({ selectedAnswers: newAnswers });

    // Update current attempt in storage
    if (currentAttempt) {
      const updatedAttempt = {
        ...currentAttempt,
        answers: newAnswers,
      };
      set({ currentAttempt: updatedAttempt });
      StorageManager.setCurrentAttempt(updatedAttempt);
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentAttempt } = get();
    if (!currentAttempt) return;

    const maxIndex = currentAttempt.questions.length - 1;
    if (currentQuestionIndex < maxIndex) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  finishAttempt: () => {
    const { currentAttempt, selectedAnswers } = get();
    if (!currentAttempt) return;

    // Calculate score
    let score = 0;
    currentAttempt.questions.forEach(question => {
      if (selectedAnswers[question.id] === question.correctAnswerId) {
        score++;
      }
    });

    const completedAttempt: QuizAttempt = {
      ...currentAttempt,
      answers: selectedAnswers,
      score,
      completedAt: new Date().toISOString(),
    };

    set({ currentAttempt: completedAttempt });
    StorageManager.saveAttempt(completedAttempt);
    StorageManager.clearCurrentAttempt();
  },

  resetQuiz: () => {
    set({
      ...initialState,
    });
    StorageManager.clearCurrentAttempt();
  },

  loadFromStorage: () => {
    const currentAttempt = StorageManager.getCurrentAttempt();
    if (currentAttempt) {
      const quiz = StorageManager.getQuizById(currentAttempt.quizId);
      set({
        currentQuiz: quiz,
        currentAttempt,
        selectedAnswers: currentAttempt.answers,
        currentQuestionIndex: 0,
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  showFeedback: (questionId: string, selectedId: string, correctId: string) => {
    const isCorrect = selectedId === correctId;

    set({
      feedbackState: {
        isVisible: true,
        isCorrect,
        selectedAnswerId: selectedId,
        correctAnswerId: correctId,
        questionId,
      },
    });

    // No auto-advance - user must click "Siguiente" manually
  },

  clearFeedback: () => {
    set({ feedbackState: null });
  },
}));
