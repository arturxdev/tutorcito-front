import { QuestionBank, Question, Answer } from '@/lib/db';

export type { QuestionBank, Question, Answer };

export interface QuestionBankWithQuestions extends QuestionBank {
  questions: (Question & {
    answers: Answer[];
  })[];
}

export interface CreateQuestionBankRequest {
  name: string;
  description?: string;
  customPrompt?: string;
  pdf: File;
  config: {
    totalQuestions: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
}

export interface AddQuestionsRequest {
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  customPrompt?: string;
}

export interface RegenerateQuestionsRequest {
  questionIds: string[];
  customPrompt?: string;
}
