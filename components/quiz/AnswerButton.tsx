'use client';

import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { playSound, SOUNDS } from '@/utils/sounds';
import { FeedbackState } from '@/types/quiz';

interface AnswerButtonProps {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  onClick: () => void;
  isSelected: boolean;
  disabled?: boolean;
  feedbackState?: {
    isSelectedAnswer: boolean;
    isCorrectAnswer: boolean;
    isShowingFeedback: boolean;
  };
}

const COLORS = {
  A: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    active: 'active:bg-red-700',
    ring: 'ring-red-400',
    glow: 'shadow-red-500/50',
    text: 'text-red-600',
  },
  B: {
    bg: 'bg-blue-500',
    hover: 'hover:bg-blue-600',
    active: 'active:bg-blue-700',
    ring: 'ring-blue-400',
    glow: 'shadow-blue-500/50',
    text: 'text-blue-600',
  },
  C: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    active: 'active:bg-yellow-700',
    ring: 'ring-yellow-400',
    glow: 'shadow-yellow-500/50',
    text: 'text-yellow-600',
  },
  D: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    active: 'active:bg-green-700',
    ring: 'ring-green-400',
    glow: 'shadow-green-500/50',
    text: 'text-green-600',
  },
};

export function AnswerButton({
  letter,
  text,
  onClick,
  isSelected,
  disabled,
  feedbackState,
}: AnswerButtonProps) {
  const colors = COLORS[letter];
  const isShowingFeedback = feedbackState?.isShowingFeedback || false;
  const isSelectedAnswer = feedbackState?.isSelectedAnswer || false;
  const isCorrectAnswer = feedbackState?.isCorrectAnswer || false;

  const handleClick = () => {
    if (!disabled && !isShowingFeedback) {
      playSound(SOUNDS.CLICK, 0.3);
      onClick();
    }
  };

  // Get button classes based on state
  const getButtonClasses = () => {
    let baseClasses = `
      relative w-full p-6 rounded-2xl text-left
      transition-all duration-200
      text-white font-semibold text-lg
      ${disabled || isShowingFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}
    `;

    // When showing feedback, handle styles via motion variants instead
    if (!isShowingFeedback) {
      baseClasses += ` ${colors.bg}`;
      if (!disabled) {
        baseClasses += ` ${colors.hover} ${colors.active}`;
      }
      if (isSelected) {
        baseClasses += ` ring-4 ${colors.ring} ${colors.glow} shadow-2xl`;
      } else {
        baseClasses += ' shadow-lg';
      }
    }

    return baseClasses;
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || isShowingFeedback}
      className={getButtonClasses()}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={
        isShowingFeedback && isSelectedAnswer && isCorrectAnswer ? "correctSelected" :
          isShowingFeedback && isSelectedAnswer && !isCorrectAnswer ? "incorrectSelected" :
            isShowingFeedback && isCorrectAnswer && !isSelectedAnswer ? "correctUnselected" :
              isShowingFeedback && !isSelectedAnswer && !isCorrectAnswer ? "disabled" : "normal"
      }
      variants={{
        normal: { opacity: 1, scale: 1, x: 0 },
        correctSelected: {
          opacity: 1,
          scale: 1.1,
          backgroundColor: '#10B981',
          boxShadow: '0 0 0 15px rgba(16, 185, 129, 0.3)',
        },
        incorrectSelected: {
          opacity: 1,
          x: [-5, 5, -5, 5, 0],
          backgroundColor: '#EF4444',
          boxShadow: '0 0 0 15px rgba(239, 68, 68, 0.3)',
        },
        correctUnselected: {
          opacity: 1,
          scale: 1.05,
          backgroundColor: '#34D399',
          boxShadow: '0 0 0 12px rgba(52, 211, 153, 0.3)',
        },
        disabled: {
          opacity: 1,
          scale: 1,
          backgroundColor: '#9CA3AF',
        },
      }}
      transition={isShowingFeedback ? (
        isSelectedAnswer ? { duration: 0.6 } :
          isCorrectAnswer ? { delay: 0.3, duration: 0.5 } : { duration: 0.3 }
      ) : {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      }}
      whileHover={!disabled && !isShowingFeedback ? { scale: 1.05, y: -4 } : {}}
      whileTap={!disabled && !isShowingFeedback ? { scale: 0.95 } : {}}
    >
      {/* Letter Badge */}
      <div className="flex items-start gap-4">
        <motion.div
          className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl"
          animate={
            isSelected && !isShowingFeedback ? { scale: [1, 1.2, 1] } :
              isShowingFeedback && isSelectedAnswer ? { scale: 1.2 } :
                isShowingFeedback && isCorrectAnswer ? { scale: 1.1 } : { scale: 1 }
          }
          transition={{ duration: 0.3 }}
        >
          {letter}
        </motion.div>

        {/* Answer Text */}
        <div className="flex-1 pt-1">
          <p className="leading-relaxed">{text}</p>
        </div>

        {/* Feedback Icon - only show for selected or correct answers */}
        {isShowingFeedback && (isSelectedAnswer || isCorrectAnswer) && (
          <motion.div
            className="flex-shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
              delay: isCorrectAnswer && !isSelectedAnswer ? 0.3 : 0,
            }}
          >
            <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center ${isCorrectAnswer ? 'text-green-600' : 'text-red-600'
              }`}>
              {isCorrectAnswer ? (
                <Check size={20} strokeWidth={3} />
              ) : (
                <X size={20} strokeWidth={3} />
              )}
            </div>
          </motion.div>
        )}

        {/* Legacy Selected Checkmark (only when not showing feedback) */}
        {!isShowingFeedback && isSelected && (
          <motion.div
            className="flex-shrink-0"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 15,
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <Check size={20} className={colors.text} strokeWidth={3} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Glow Effect for Selected (only when not showing feedback) */}
      {!isShowingFeedback && isSelected && (
        <motion.div
          className="absolute inset-0 rounded-2xl bg-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </motion.button>
  );
}
