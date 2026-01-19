"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StorageManager } from "@/utils/storage";
import { QuizAttempt, GeneratedQuiz } from "@/types/quiz";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuizStore } from "@/store/quizStore";

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if params.id exists and is a string
    const id = Array.isArray(params?.id) ? params?.id[0] : params?.id;
    
    if (id) {
      const attempts = StorageManager.getAllAttempts();
      const foundAttempt = attempts.find(a => a.id === id);
      
      if (foundAttempt) {
        setAttempt(foundAttempt);
        const foundQuiz = StorageManager.getQuizById(foundAttempt.quizId);
        setQuiz(foundQuiz);
      }
    }
    setLoading(false);
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Examen no encontrado</h1>
        <p className="text-gray-500 mb-8">No pudimos encontrar el resultado que buscas.</p>
        <Button onClick={() => router.push('/historial')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Historial
        </Button>
      </div>
    );
  }

  const handleBack = () => {
    router.push('/historial');
  };

  return (
    <HistoryDetailContent 
      attempt={attempt} 
      quiz={quiz} 
      onBack={handleBack}
    />
  );
}

function HistoryDetailContent({ 
  attempt, 
  quiz, 
  onBack 
}: { 
  attempt: QuizAttempt; 
  quiz: GeneratedQuiz | null; 
  onBack: () => void; 
}) {
  const router = useRouter();
  const { startAttempt, setQuiz: setStoreQuiz } = useQuizStore();

  const handleRetry = () => {
    if (quiz) {
      setStoreQuiz(quiz);
      startAttempt(quiz.config);
      router.push("/quiz");
    }
  };

  return (
    <QuizResults
      attempt={attempt}
      quiz={quiz}
      onHome={onBack}
      onRetry={quiz ? handleRetry : undefined}
      disableConfetti={true}
    />
  );
}