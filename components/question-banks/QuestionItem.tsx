'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { DifficultyBadge } from '@/components/quiz/DifficultyBadge';
import { Card } from '@/components/ui/card';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
}

interface QuestionItemProps {
  question: {
    id: string;
    questionText: string;
    difficulty: 'easy' | 'medium' | 'hard';
    answers: Answer[];
  };
  index: number;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showSelection?: boolean;
}

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function QuestionItem({
  question,
  index,
  isSelected = false,
  onSelect,
  showSelection = false,
}: QuestionItemProps) {
  // Sort answers by displayOrder
  const sortedAnswers = [...question.answers].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${
        isSelected ? 'border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-2 border-transparent'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {showSelection && onSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect(question.id)}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            )}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                Pregunta #{index + 1}
              </span>
              <DifficultyBadge difficulty={question.difficulty} />
            </div>
          </div>
        </div>

        {/* Question Text */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 leading-relaxed">
          {question.questionText}
        </h3>

        {/* Answers */}
        <div className="space-y-3">
          {sortedAnswers.map((answer, answerIndex) => (
            <div
              key={answer.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                answer.isCorrect
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700'
                  : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent'
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                answer.isCorrect
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}>
                {ANSWER_LETTERS[answerIndex]}
              </div>
              <p className={`flex-1 text-gray-700 dark:text-gray-300 ${
                answer.isCorrect ? 'font-semibold' : ''
              }`}>
                {answer.text}
              </p>
              {answer.isCorrect && (
                <div className="flex-shrink-0">
                  <div className="bg-green-600 rounded-full p-1">
                    <Check size={16} className="text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
