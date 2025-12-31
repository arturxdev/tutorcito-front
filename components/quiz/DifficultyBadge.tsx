'use client';

import { Badge } from '@/components/ui/badge';
import { Difficulty } from '@/types/quiz';
import { motion } from 'framer-motion';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

const DIFFICULTY_CONFIG = {
  easy: {
    label: 'Fácil',
    color: 'bg-green-500 text-white border-green-600',
    icon: '🌱',
  },
  medium: {
    label: 'Media',
    color: 'bg-yellow-500 text-white border-yellow-600',
    icon: '⚡',
  },
  hard: {
    label: 'Difícil',
    color: 'bg-red-500 text-white border-red-600',
    icon: '🔥',
  },
};

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const config = DIFFICULTY_CONFIG[difficulty];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Badge variant="outline" className={`${config.color} text-sm px-3 py-1`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </Badge>
    </motion.div>
  );
}
