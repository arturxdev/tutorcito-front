"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/store/quizStore";
import { QuizResults } from "@/components/quiz/QuizResults";
import { playSound, SOUNDS } from "@/utils/sounds";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResultsPage() {
  const router = useRouter();
  const { currentAttempt, currentQuiz, startAttempt, resetQuiz } =
    useQuizStore();

  useEffect(() => {
    if (!currentAttempt || !currentAttempt.completedAt) {
      router.push("/dashboard");
      return;
    }

    // Show toast notification based on whether attempt was saved to API
    if (currentAttempt.djangoAttemptId) {
      toast.success("Intento guardado correctamente", {
        description: "Tus resultados se han guardado en el servidor",
        icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      });
    } else if (currentQuiz?.examId) {
      // Quiz has examId but no djangoAttemptId - likely save failed
      toast.info("Intento guardado localmente", {
        description: "No se pudo guardar en el servidor, pero tus resultados están disponibles",
        icon: <XCircle className="w-5 h-5 text-yellow-500" />,
      });
    }
  }, [currentAttempt, currentQuiz, router]);

  if (!currentAttempt || !currentQuiz) {
    return null;
  }


  const handleGoHome = () => {
    playSound(SOUNDS.CLICK);
    resetQuiz();
    router.push("/dashboard");
  };

  return (
    <QuizResults
      attempt={currentAttempt}
      quiz={currentQuiz}
      onHome={handleGoHome}
    />
  );
}
