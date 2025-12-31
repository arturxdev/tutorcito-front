import { Question, QuizConfig } from '@/types/quiz';

/**
 * Fisher-Yates shuffle algorithm to randomize array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select random questions based on difficulty distribution
 */
export function selectRandomQuestions(
  allQuestions: Question[],
  config: QuizConfig
): Question[] {
  const easy = allQuestions.filter(q => q.difficulty === 'easy');
  const medium = allQuestions.filter(q => q.difficulty === 'medium');
  const hard = allQuestions.filter(q => q.difficulty === 'hard');

  const selectedEasy = shuffleArray(easy).slice(0, config.easyCount);
  const selectedMedium = shuffleArray(medium).slice(0, config.mediumCount);
  const selectedHard = shuffleArray(hard).slice(0, config.hardCount);

  return shuffleArray([...selectedEasy, ...selectedMedium, ...selectedHard]);
}

/**
 * Calculate proportional distribution of questions by difficulty
 */
export function calculateDistribution(totalQuestions: number): {
  easy: number;
  medium: number;
  hard: number;
} {
  const base = Math.floor(totalQuestions / 3);
  const remainder = totalQuestions % 3;

  return {
    easy: base + (remainder > 0 ? 1 : 0),
    medium: base + (remainder > 1 ? 1 : 0),
    hard: base,
  };
}
