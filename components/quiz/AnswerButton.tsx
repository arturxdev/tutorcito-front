'use client';

import { Check, X } from 'lucide-react';
import { playSound, SOUNDS } from '@/utils/sounds';
import { Button3D } from '@/components/ui/button-3d';

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

// Map letters to Button3D variants
const LETTER_VARIANTS = {
  A: 'red' as const,
  B: 'blue' as const,
  C: 'yellow' as const,
  D: 'green' as const,
};

export function AnswerButton({
  letter,
  text,
  onClick,
  isSelected,
  disabled,
  feedbackState,
}: AnswerButtonProps) {
  const isShowingFeedback = feedbackState?.isShowingFeedback || false;
  const isSelectedAnswer = feedbackState?.isSelectedAnswer || false;
  const isCorrectAnswer = feedbackState?.isCorrectAnswer || false;

  const handleClick = () => {
    if (!disabled && !isShowingFeedback) {
      playSound(SOUNDS.CLICK, 0.3);
      onClick();
    }
  };

  // Determine visual state
  let variant: 'red' | 'blue' | 'yellow' | 'green' | 'white' = LETTER_VARIANTS[letter];
  let iconBgColor = "bg-black/20";
  let iconTextColor = "text-white";
  let showIcon: "letter" | "check" | "x" = "letter";

  if (isShowingFeedback) {
    if (isCorrectAnswer) {
      // Always show correct answer in green when showing result
      variant = "green";
      showIcon = "check";
    } else if (isSelectedAnswer && !isCorrectAnswer) {
      // Show selected incorrect answer in red
      variant = "red";
      showIcon = "x";
    } else {
      // Show other incorrect answers in gray/white
      variant = "white";
      showIcon = "letter";
    }
  }

  return (
    <Button3D
      variant={variant}
      onClick={handleClick}
      disabled={disabled || isShowingFeedback}
      className="w-full flex items-center  gap-3 justify-start disabled:opacity-100 min-h-[3rem] px-6 py-6 whitespace-normal"
    >
      <div
        className={`${iconBgColor} w-8 h-8 rounded flex items-center justify-center shrink-0 font-bold ${iconTextColor}`}
      >
        {showIcon === "check" && <Check className="w-5 h-5" />}
        {showIcon === "x" && <X className="w-5 h-5" />}
        {showIcon === "letter" && letter}
      </div>
      <span className="font-bold text-sm md:text-base leading-snug text-left flex-1">
        {text}
      </span>
    </Button3D>
  );
}
