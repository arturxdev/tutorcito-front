/**
 * Mapeo entre niveles de dificultad del frontend y Django
 * Frontend: 'easy' | 'medium' | 'hard'
 * Django:   'facil' | 'medio' | 'dificil'
 */

import type { DjangoQuestion, QuestionDifficulty } from '@/types/django-api';

export type FrontendDifficulty = 'easy' | 'medium' | 'hard';
export type DjangoDifficulty = QuestionDifficulty; // 'facil' | 'medio' | 'dificil'

/**
 * Convierte dificultad del frontend a formato Django
 */
export function toDjangoDifficulty(difficulty: FrontendDifficulty): DjangoDifficulty {
  const map: Record<FrontendDifficulty, DjangoDifficulty> = {
    easy: 'facil',
    medium: 'medio',
    hard: 'dificil',
  };
  return map[difficulty];
}

/**
 * Convierte dificultad de Django a formato frontend
 */
export function toFrontendDifficulty(difficulty: DjangoDifficulty): FrontendDifficulty {
  const map: Record<string, FrontendDifficulty> = {
    facil: 'easy',
    medio: 'medium',
    dificil: 'hard',
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
  };
  return map[difficulty] || 'medium';
}

/**
 * Cuenta preguntas por nivel de dificultad
 */
export function countByDifficulty(questions: DjangoQuestion[]): {
  easy: number;
  medium: number;
  hard: number;
  total: number;
} {
  const counts = {
    easy: 0,
    medium: 0,
    hard: 0,
    total: questions.length,
  };

  questions.forEach((q) => {
    const frontendDifficulty = toFrontendDifficulty(q.difficulty);
    counts[frontendDifficulty]++;
  });

  return counts;
}
