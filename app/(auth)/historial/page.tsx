"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, XCircle, Clock, ArrowRight } from "lucide-react";
import { StorageManager } from "@/utils/storage";
import { QuizAttempt, GeneratedQuiz } from "@/types/quiz";
import { Card3D } from "@/components/ui/card-3d";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateScore } from "@/utils/scoring";

interface HistoryItem {
  attempt: QuizAttempt;
  quiz: GeneratedQuiz | null;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const attempts = StorageManager.getAllAttempts();
    // Sort by date descending (newest first)
    attempts.sort((a, b) => 
      new Date(b.completedAt || b.startedAt).getTime() - new Date(a.completedAt || a.startedAt).getTime()
    );

    const historyItems = attempts.map(attempt => ({
      attempt,
      quiz: StorageManager.getQuizById(attempt.quizId)
    }));

    setHistory(historyItems);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Historial de Exámenes</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Historial de Exámenes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Revisa tus resultados y progreso
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No hay exámenes registrados</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Comienza un examen para ver tu historial aquí.
          </p>
          <Button asChild>
            <Link href="/documentos">Ir a mis documentos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map(({ attempt, quiz }, index) => {
            const scoreData = calculateScore(attempt.questions, attempt.answers);
            const date = new Date(attempt.completedAt || attempt.startedAt);
            const formattedDate = new Intl.DateTimeFormat('es-MX', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(date);

            const isPassing = scoreData.percentage >= 60;

            return (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/historial/${attempt.id}`}>
                  <Card3D 
                    variant="interactive" 
                    className="h-full flex flex-col hover:border-purple-200 dark:hover:border-purple-800 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <Badge 
                        variant="outline" 
                        className={isPassing 
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" 
                          : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                        }
                      >
                        {isPassing ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {scoreData.score}/{scoreData.total} ({Math.round(scoreData.percentage)}%)
                      </Badge>
                      <span className="text-xs text-gray-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {date.toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {quiz?.pdfName || "Examen Eliminado"}
                    </h3>

                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formattedDate.split(',')[1].trim()}
                      </span>
                      <span className="flex items-center text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-200">
                        Ver detalles
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </Card3D>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
