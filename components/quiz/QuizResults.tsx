"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { calculateScore, getMotivationalMessage } from "@/utils/scoring";
import { playSound, SOUNDS } from "@/utils/sounds";
import { GeneratedQuiz, QuizAttempt } from "@/types/quiz";
import { useQuizStore } from "@/store/quizStore";

interface QuizResultsProps {
  attempt: QuizAttempt;
  quiz?: GeneratedQuiz | null;
  onRetry?: () => void;
  onHome?: () => void;
  disableConfetti?: boolean;
}

export function QuizResults({ 
  attempt, 
  quiz, 
  onRetry, 
  onHome,
  disableConfetti = false 
}: QuizResultsProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(!disableConfetti);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    if (!disableConfetti) {
      // Play completion sound
      playSound(SOUNDS.COMPLETE);
      
      // Stop confetti after 5 seconds
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [disableConfetti]);

  const scoreData = calculateScore(
    attempt.questions,
    attempt.answers
  );
  const motivationalMessage = getMotivationalMessage(scoreData.percentage);

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Confetti */}
      {showConfetti && scoreData.percentage >= 60 && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={scoreData.percentage >= 90 ? 500 : 300}
          colors={["#8B5CF6", "#3B82F6", "#EC4899", "#10B981", "#F59E0B"]}
        />
      )}

      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Logo size="sm" />
          <Button
            variant="outline"
            size="sm"
            onClick={onHome}
            className="gap-2"
          >
            <Home size={16} />
            Inicio
          </Button>
        </div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <Card className="p-8 md:p-12 mb-8 bg-white dark:bg-gray-800 shadow-2xl">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {disableConfetti ? "Detalle del Examen" : "¡Quiz Completado!"}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                {motivationalMessage}
              </p>
            </motion.div>

            {/* Score Display */}
            <motion.div
              className="flex flex-col items-center justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0 552" }}
                    animate={{
                      strokeDasharray: `${
                        (scoreData.percentage / 100) * 552
                      } 552`,
                    }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#3B82F6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {scoreData.percentage}%
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    {scoreData.score}/{scoreData.total}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Breakdown by Difficulty */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {(["easy", "medium", "hard"] as const).map((difficulty) => {
                const data = scoreData.byDifficulty[difficulty];
                const percentage =
                  data.total > 0 ? (data.correct / data.total) * 100 : 0;
                const config = {
                  easy: { label: "Fácil", color: "green", icon: "🌱" },
                  medium: { label: "Media", color: "yellow", icon: "⚡" },
                  hard: { label: "Difícil", color: "red", icon: "🔥" },
                }[difficulty];

                return (
                  <Card
                    key={difficulty}
                    className={`p-4 bg-${config.color}-50 dark:bg-${config.color}-950/20 border-${config.color}-200 dark:border-${config.color}-800`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`bg-${config.color}-500 text-white`}>
                        {config.icon} {config.label}
                      </Badge>
                      <span
                        className={`text-2xl font-bold text-${config.color}-700 dark:text-${config.color}-300`}
                      >
                        {data.correct}/{data.total}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <p
                      className={`text-xs text-${config.color}-600 dark:text-${config.color}-400 mt-2`}
                    >
                      {Math.round(percentage)}% correcto
                    </p>
                  </Card>
                );
              })}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {onRetry && (
                <Button
                  size="lg"
                  onClick={onRetry}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 gap-2"
                >
                  <RefreshCw size={20} />
                  Nuevo Intento
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={onHome}
                className="gap-2"
              >
                <Home size={20} />
                {disableConfetti ? "Volver" : "Volver al Inicio"}
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        {/* Answer Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Revisión de Respuestas
          </h2>

          <div className="space-y-4">
            {attempt.questions.map((question, index) => {
              const userAnswerId = attempt.answers[question.id];
              const correctAnswer = question.answers.find(
                (a) => a.id === question.correctAnswerId
              );
              const userAnswer = question.answers.find(
                (a) => a.id === userAnswerId
              );
              const isCorrect = userAnswerId === question.correctAnswerId;
              const isExpanded = expandedQuestions.has(question.id);

              return (
                <Card
                  key={question.id}
                  className={`overflow-hidden ${
                    isCorrect
                      ? "border-green-500 dark:border-green-600"
                      : "border-red-500 dark:border-red-600"
                  }`}
                >
                  <button
                    onClick={() => toggleQuestion(question.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                          isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        {isCorrect ? "✓" : "✗"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {index + 1}. {question.question}
                        </p>
                        <Badge
                          variant="outline"
                          className={`mt-2 ${
                            question.difficulty === "easy"
                              ? "border-green-500 text-green-700"
                              : question.difficulty === "medium"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-red-500 text-red-700"
                          }`}
                        >
                          {question.difficulty === "easy"
                            ? "🌱 Fácil"
                            : question.difficulty === "medium"
                            ? "⚡ Media"
                            : "🔥 Difícil"}
                        </Badge>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="space-y-3">
                        {userAnswer && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              Tu respuesta:
                            </p>
                            <p
                              className={`p-3 rounded-lg ${
                                isCorrect
                                  ? "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                                  : "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
                              }`}
                            >
                              {userAnswer.text} {isCorrect ? "✓" : "✗"}
                            </p>
                          </div>
                        )}
                        {!isCorrect && correctAnswer && (
                          <div>
                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                              Respuesta correcta:
                            </p>
                            <p className="p-3 rounded-lg bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                              {correctAnswer.text} ✓
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </Card>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
