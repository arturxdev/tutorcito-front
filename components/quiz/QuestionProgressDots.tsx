'use client';

import { motion } from 'framer-motion';

interface QuestionProgressDotsProps {
  current: number; // 1-indexed
  total: number;
  answered: Set<number>; // Set of answered question indices (0-indexed)
}

export function QuestionProgressDots({ current, total, answered }: QuestionProgressDotsProps) {
  // Si hay muchas preguntas (>15), mostrar solo un rango alrededor de la actual
  const maxVisible = 15;
  const shouldShowSubset = total > maxVisible;

  let visibleRange: number[];
  if (shouldShowSubset) {
    // Mostrar 7 antes, actual, 7 después
    const halfRange = Math.floor(maxVisible / 2);
    let start = Math.max(1, current - halfRange);
    let end = Math.min(total, start + maxVisible - 1);

    // Ajustar si estamos cerca del final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    visibleRange = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else {
    visibleRange = Array.from({ length: total }, (_, i) => i + 1);
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {visibleRange.map((questionNum) => {
        const isCurrent = questionNum === current;
        const isAnswered = answered.has(questionNum - 1); // Convert to 0-indexed

        return (
          <motion.div
            key={questionNum}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${isCurrent
                ? 'bg-purple-600 dark:bg-purple-500 w-3 h-3'
                : isAnswered
                  ? 'bg-green-500 dark:bg-green-400'
                  : 'bg-gray-300 dark:bg-gray-600'}
            `}
          />
        );
      })}
    </div>
  );
}
