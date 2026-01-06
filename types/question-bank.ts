/**
 * Tipos para Question Banks (abstracción sobre Documents + Exams de Django)
 */

import type { DjangoDocument, DjangoExam, DjangoQuestion } from './django-api';

/**
 * QuestionBank representa un Document de Django con su Exam principal
 * Es una abstracción del frontend sobre la estructura Django de Documents + Exams
 */
export interface QuestionBank {
  id: string; // Document ID convertido a string para compatibilidad
  name: string;
  pdfName: string;
  pdfUrl: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  createdAt: string;
  
  // Referencias internas (opcionales, para debugging)
  _documentId?: number;
  _examId?: number | null;
}

/**
 * Question mapeada desde DjangoQuestion
 * Convierte la estructura de Django a un formato más amigable para el frontend
 */
export interface Question {
  id: number;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Convertido desde Django's 'facil'|'medio'|'dificil'
  answers: Answer[];
}

/**
 * Answer extraída del JSONField options de DjangoQuestion
 */
export interface Answer {
  text: string;
  isCorrect: boolean;
}

/**
 * QuestionBank con sus preguntas cargadas
 */
export interface QuestionBankWithQuestions extends QuestionBank {
  questions: Question[];
}

/**
 * Request types para compatibilidad con código legacy
 */
export interface CreateQuestionBankRequest {
  name?: string;
  pdf: File;
  config?: {
    totalQuestions?: number;
    page_start?: number;
    page_end?: number;
  };
}

export interface AddQuestionsRequest {
  page_start?: number;
  page_end?: number;
  num_questions?: number;
}

export interface RegenerateQuestionsRequest {
  page_start?: number;
  page_end?: number;
  num_questions?: number;
}
