'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface QuestionConfigProps {
  onChange: (config: {
    totalQuestions: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  }) => void;
  disabled?: boolean;
  maxQuestions?: number;
}

export function QuestionConfig({ 
  onChange, 
  disabled,
  maxQuestions = 100 
}: QuestionConfigProps) {
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [easyCount, setEasyCount] = useState(10);
  const [mediumCount, setMediumCount] = useState(10);
  const [hardCount, setHardCount] = useState(10);

  // Recalcular distribución cuando cambia el total
  useEffect(() => {
    const base = Math.floor(totalQuestions / 3);
    const remainder = totalQuestions % 3;

    const newEasy = base + (remainder > 0 ? 1 : 0);
    const newMedium = base + (remainder > 1 ? 1 : 0);
    const newHard = base;

    setEasyCount(newEasy);
    setMediumCount(newMedium);
    setHardCount(newHard);
  }, [totalQuestions]);

  // Notificar cambios al padre
  useEffect(() => {
    onChange({
      totalQuestions,
      easyCount,
      mediumCount,
      hardCount,
    });
  }, [totalQuestions, easyCount, mediumCount, hardCount, onChange]);

  const isValid = easyCount + mediumCount + hardCount === totalQuestions;

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
              de {maxQuestions} disponibles
            </span>
          </div>
          
          <Slider
            id="total-questions"
            min={3}
            max={maxQuestions}
            step={1}
            value={[totalQuestions]}
            onValueChange={(value) => setTotalQuestions(value[0])}
            disabled={disabled}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Min: 3</span>
            <span>Max: {maxQuestions}</span>
          </div>
          
          {totalQuestions > 50 && (
            <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-xs text-amber-900 dark:text-amber-300">
                ⚠️ <strong>Nota:</strong> Generar más de 50 preguntas puede tomar varios minutos 
                y podría fallar con PDFs muy grandes. Se recomienda empezar con 30-40 preguntas.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-300 dark:border-gray-600 pt-6">
        <Label className="text-lg font-semibold mb-4 block">
          Distribución por Dificultad (Manual)
        </Label>
        
        <div className="space-y-4 mb-4">
          {/* Fácil */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="easy-count" className="text-sm">
                🟢 Fácil
              </Label>
              <motion.span
                key={`easy-${easyCount}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-green-700 dark:text-green-300"
              >
                {easyCount}
              </motion.span>
            </div>
            <Slider
              id="easy-count"
              min={0}
              max={totalQuestions}
              step={1}
              value={[easyCount]}
              onValueChange={(value) => {
                const newEasy = value[0];
                const remaining = totalQuestions - newEasy;
                const newMedium = Math.min(mediumCount, remaining);
                const newHard = remaining - newMedium;
                setEasyCount(newEasy);
                setMediumCount(newMedium);
                setHardCount(newHard);
              }}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Media */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="medium-count" className="text-sm">
                🟡 Media
              </Label>
              <motion.span
                key={`medium-${mediumCount}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-yellow-700 dark:text-yellow-300"
              >
                {mediumCount}
              </motion.span>
            </div>
            <Slider
              id="medium-count"
              min={0}
              max={totalQuestions}
              step={1}
              value={[mediumCount]}
              onValueChange={(value) => {
                const newMedium = value[0];
                const remaining = totalQuestions - newMedium;
                const newEasy = Math.min(easyCount, remaining);
                const newHard = remaining - newEasy;
                setEasyCount(newEasy);
                setMediumCount(newMedium);
                setHardCount(newHard);
              }}
              disabled={disabled}
              className="w-full"
            />
          </div>

          {/* Difícil */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="hard-count" className="text-sm">
                🔴 Difícil
              </Label>
              <motion.span
                key={`hard-${hardCount}`}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-red-700 dark:text-red-300"
              >
                {hardCount}
              </motion.span>
            </div>
            <Slider
              id="hard-count"
              min={0}
              max={totalQuestions}
              step={1}
              value={[hardCount]}
              onValueChange={(value) => {
                const newHard = value[0];
                const remaining = totalQuestions - newHard;
                const newEasy = Math.min(easyCount, remaining);
                const newMedium = remaining - newEasy;
                setEasyCount(newEasy);
                setMediumCount(newMedium);
                setHardCount(newHard);
              }}
              disabled={disabled}
              className="w-full"
            />
          </div>
        </div>

        {/* Validación */}
        <div className={`p-3 rounded-lg ${isValid ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          <p className={`text-sm font-medium ${isValid ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
            Total: {easyCount} + {mediumCount} + {hardCount} = {easyCount + mediumCount + hardCount} {isValid ? '✓' : `(debe ser ${totalQuestions})`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
