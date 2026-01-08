'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center text-sm font-medium">
        <motion.span
          key={`progress-${current}`}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-gray-700 dark:text-gray-300"
        >
          Pregunta {current} de {total}
        </motion.span>
        <motion.span
          key={`percentage-${percentage}`}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className=" dark:text-white"
        >
          {Math.round(percentage)}%
        </motion.span>
      </div>
      <Progress value={percentage} className="h-3" />
    </div>
  );
}
