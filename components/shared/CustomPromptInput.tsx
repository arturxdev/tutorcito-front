'use client';

import { useState } from 'react';
import { Label, Button } from '@/src/shared/ui';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CustomPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

const PROMPT_EXAMPLES = [
  'Solo genera preguntas de la sección 1: Introducción',
  'Enfócate únicamente en el sistema cardiovascular',
  'Excluye ejercicios, solo teoría y conceptos',
  'Prioriza casos clínicos y aplicaciones prácticas',
  'Solo preguntas sobre capítulos 3, 4 y 5',
];

export function CustomPromptInput({
  value,
  onChange,
  disabled,
  error
}: CustomPromptInputProps) {
  const [showExamples, setShowExamples] = useState(false);

  const handleExampleClick = (example: string) => {
    onChange(example);
    setShowExamples(false);
  };

  const charCount = value.length;
  const maxChars = 500;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="custom-prompt" className="text-lg font-semibold">
          🤖 Instrucciones para la IA
          <span className="text-sm font-normal text-gray-500 ml-2">(opcional)</span>
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowExamples(!showExamples)}
          className="gap-2"
        >
          <Lightbulb size={16} />
          {showExamples ? 'Ocultar' : 'Ver'} ejemplos
          {showExamples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </Button>
      </div>

      <textarea
        id="custom-prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Ejemplo: Solo genera preguntas de la sección 1 y 2. Enfócate en conceptos fundamentales..."
        className={cn(
          "w-full min-h-[120px] p-4 rounded-xl border resize-y",
          "bg-white dark:bg-gray-800",
          "border-gray-300 dark:border-gray-600",
          "focus:ring-2 focus:ring-purple-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-500 focus:ring-red-500"
        )}
        maxLength={maxChars}
      />

      <div className="flex items-center justify-between">
        <p className={cn(
          "text-xs transition-colors",
          charCount > 450 ? "text-red-600" :
            charCount > 400 ? "text-amber-600" :
              "text-gray-500"
        )}>
          {charCount}/{maxChars} caracteres
        </p>
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>

      <AnimatePresence>
        {showExamples && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              💡 Ejemplos de instrucciones:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {PROMPT_EXAMPLES.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                  disabled={disabled}
                  className="text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 
                           dark:bg-blue-900/20 dark:hover:bg-blue-900/30
                           text-sm text-blue-900 dark:text-blue-300 transition-colors 
                           disabled:opacity-50 disabled:cursor-not-allowed 
                           border border-blue-200 dark:border-blue-800"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-900 dark:text-amber-300">
          <strong>💡 Consejo:</strong> Sé específico sobre qué secciones,
          capítulos o temas quieres incluir/excluir. La IA respetará tus
          instrucciones al generar las preguntas.
        </p>
      </div>
    </div>
  );
}
