import { Question, Difficulty, ScoreBreakdown } from '@/types/quiz';

/**
 * Calculate quiz score with breakdown by difficulty
 */
export function calculateScore(
  questions: Question[],
  answers: Record<string, string>
): ScoreBreakdown {
  let correct = 0;
  const byDifficulty: Record<Difficulty, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  questions.forEach(q => {
    byDifficulty[q.difficulty].total++;
    if (answers[q.id] === q.correctAnswerId) {
      correct++;
      byDifficulty[q.difficulty].correct++;
    }
  });

  return {
    score: correct,
    total: questions.length,
    percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    byDifficulty,
  };
}

/**
 * Get motivational message based on score percentage
 */
export function getMotivationalMessage(percentage: number): string {
  if (percentage === 100) return '¡Perfecto! 🏆 ¡Eres un maestro absoluto!';
  if (percentage >= 90) return '¡Excelente! 🌟 ¡Casi perfecto!';
  if (percentage >= 80) return '¡Muy bien! 🎉 ¡Gran trabajo!';
  if (percentage >= 70) return '¡Buen trabajo! 👏 Vas por buen camino';
  if (percentage >= 60) return '¡Bien hecho! 💪 Sigue practicando';
  if (percentage >= 50) return '¡No está mal! 📚 Puedes mejorar';
  return '¡Sigue intentando! 🚀 La práctica hace al maestro';
}
