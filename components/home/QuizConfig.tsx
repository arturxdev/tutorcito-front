'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { calculateDistribution } from '@/utils/random';
import { QuizConfig as QuizConfigType } from '@/types/quiz';

interface QuizConfigProps {
  onChange: (config: QuizConfigType) => void;
  disabled?: boolean;
}

export function QuizConfig({ onChange, disabled }: QuizConfigProps) {
  const [totalQuestions, setTotalQuestions] = useState(30);
  const distribution = calculateDistribution(totalQuestions);

  useEffect(() => {
    onChange({
      totalQuestions,
      easyCount: distribution.easy,
      mediumCount: distribution.medium,
      hardCount: distribution.hard,
    });
  }, [totalQuestions, distribution.easy, distribution.medium, distribution.hard, onChange]);

  return (
    <motion.div
      className="w-full space-y-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div>
        <Label htmlFor="total-questions" className="text-lg font-semibold mb-4 block">
          Número de Preguntas
        </Label>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <motion.span
              key={totalQuestions}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              {totalQuestions}
            </motion.span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              de 60 disponibles
            </span>
          </div>
          
          <Slider
            id="total-questions"
            min={3}
            max={60}
            step={1}
            value={[totalQuestions]}
            onValueChange={(value) => setTotalQuestions(value[0])}
            disabled={disabled}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Min: 3</span>
            <span>Max: 60</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-600 pt-6">
        <Label className="text-lg font-semibold mb-4 block">
          Distribución por Dificultad
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <motion.div
            className="p-4 rounded-xl bg-green-100 dark:bg-green-950/30 border border-green-300 dark:border-green-700"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-green-500 text-white border-green-600">
                Fácil
              </Badge>
              <motion.span
                key={`easy-${distribution.easy}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-green-700 dark:text-green-300"
              >
                {distribution.easy}
              </motion.span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Preguntas básicas
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-xl bg-yellow-100 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-700"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-yellow-500 text-white border-yellow-600">
                Media
              </Badge>
              <motion.span
                key={`medium-${distribution.medium}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-yellow-700 dark:text-yellow-300"
              >
                {distribution.medium}
              </motion.span>
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Nivel intermedio
            </p>
          </motion.div>

          <motion.div
            className="p-4 rounded-xl bg-red-100 dark:bg-red-950/30 border border-red-300 dark:border-red-700"
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="bg-red-500 text-white border-red-600">
                Difícil
              </Badge>
              <motion.span
                key={`hard-${distribution.hard}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-red-700 dark:text-red-300"
              >
                {distribution.hard}
              </motion.span>
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Desafío avanzado
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
