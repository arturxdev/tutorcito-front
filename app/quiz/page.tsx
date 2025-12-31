'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { useQuizStore } from '@/store/quizStore';
import { Logo } from '@/components/layout/Logo';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { DifficultyBadge } from '@/components/quiz/DifficultyBadge';
import { AnswerButton } from '@/components/quiz/AnswerButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { shuffleArray } from '@/utils/random';
import { playSound, SOUNDS } from '@/utils/sounds';
import { toast } from 'sonner';
import { Answer } from '@/types/quiz';

export default function QuizPage() {
  const router = useRouter();
  const {
    currentQuiz,
    currentAttempt,
    currentQuestionIndex,
    selectedAnswers,
    feedbackState,
    startAttempt,
    selectAnswer,
    showFeedback,
    clearFeedback,
    nextQuestion,
    previousQuestion,
    finishAttempt,
  } = useQuizStore();

  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<Answer[]>([]);

  // Start attempt if not already started
  useEffect(() => {
    if (currentQuiz && !currentAttempt) {
      console.log('🎮 [Quiz] Iniciando quiz con config:', currentQuiz.config);
      // Use the config from the quiz
      startAttempt(currentQuiz.config);
    } else if (!currentQuiz) {
      // No quiz loaded, redirect to home
      toast.error('No hay quiz cargado');
      router.push('/');
    }
  }, [currentQuiz, currentAttempt, startAttempt, router]);

  const currentQuestion = currentAttempt?.questions[currentQuestionIndex];

  // Shuffle answers when question changes (using useMemo to avoid effect)
  const shuffledAnswersForCurrentQuestion = useMemo(() => {
    if (!currentQuestion) return [];
    return shuffleArray([...currentQuestion.answers]);
  }, [currentQuestion?.id]);

  // Update state when shuffled answers change
  useEffect(() => {
    setShuffledAnswers(shuffledAnswersForCurrentQuestion);
  }, [shuffledAnswersForCurrentQuestion]);

  if (!currentAttempt || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando quiz...</p>
        </div>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === currentAttempt.questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const selectedAnswerId = selectedAnswers[currentQuestion.id];

  const handleAnswerSelect = (answerId: string) => {
    // Guardar la respuesta
    selectAnswer(currentQuestion.id, answerId);

    // Mostrar feedback inmediato con animación y sonido
    const correctAnswerId = currentQuestion.correctAnswerId;
    showFeedback(currentQuestion.id, answerId, correctAnswerId);

    // Reproducir sonido correspondiente
    const isCorrect = answerId === correctAnswerId;
    playSound(isCorrect ? SOUNDS.CORRECT : SOUNDS.INCORRECT);
  };

  const handleNext = () => {
    // Clear feedback before moving to next question
    if (feedbackState) {
      clearFeedback();
    }

    if (isLastQuestion) {
      setShowFinishDialog(true);
    } else {
      playSound(SOUNDS.NEXT, 0.3);
      nextQuestion();
    }
  };

  const handlePrevious = () => {
    playSound(SOUNDS.NEXT, 0.3);
    previousQuestion();
  };

  const handleFinish = () => {
    finishAttempt();
    playSound(SOUNDS.COMPLETE);
    router.push('/results');
  };

  const handleGoHome = () => {
    if (confirm('¿Estás seguro? Perderás el progreso actual.')) {
      router.push('/');
    }
  };

  const answeredQuestions = Object.keys(selectedAnswers).length;
  const unansweredCount = currentAttempt.questions.length - answeredQuestions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Logo size="sm" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoHome}
            className="gap-2"
          >
            <Home size={16} />
            Inicio
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={currentAttempt.questions.length}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12"
          >
            {/* Difficulty Badge */}
            <div className="mb-6">
              <DifficultyBadge difficulty={currentQuestion.difficulty} />
            </div>

            {/* Question Text */}
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 leading-relaxed"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {currentQuestion.question}
            </motion.h2>

            {/* Answer Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {shuffledAnswers.map((answer, index) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <AnswerButton
                    letter={['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D'}
                    text={answer.text}
                    onClick={() => handleAnswerSelect(answer.id)}
                    isSelected={selectedAnswerId === answer.id}
                    feedbackState={{
                      isSelectedAnswer: feedbackState?.selectedAnswerId === answer.id,
                      isCorrectAnswer: feedbackState?.correctAnswerId === answer.id,
                      isShowingFeedback: feedbackState?.isVisible || false,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className="gap-2"
              >
                <ChevronLeft size={20} />
                Anterior
              </Button>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {answeredQuestions} de {currentAttempt.questions.length} respondidas
              </div>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswerId}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isLastQuestion ? 'Finalizar' : 'Siguiente'}
                <ChevronRight size={20} />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Finish Confirmation Dialog */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Finalizar Quiz?</DialogTitle>
            <DialogDescription>
              {unansweredCount > 0 ? (
                <>
                  Tienes <strong>{unansweredCount}</strong> pregunta
                  {unansweredCount === 1 ? '' : 's'} sin responder.
                  {' '}Las preguntas sin respuesta se contarán como incorrectas.
                </>
              ) : (
                'Has respondido todas las preguntas. ¿Deseas ver tus resultados?'
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
              Continuar
            </Button>
            <Button
              onClick={handleFinish}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Ver Resultados
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
