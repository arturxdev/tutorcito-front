/**
 * Tipos para la API de Django (Documents, Exams, Questions)
 */

export interface DjangoDocument {
  id: number;
  url: string;
  name: string;
  size: number;
  content_type: string;
  r2_key: string;
  hash_md5: string;
  num_pages: number;
  created_at: string;
  user: number;
}

export type ExamStatus = 'process' | 'done' | 'fail';

export interface DjangoExam {
  id: number;
  document: number;
  user: number;
  page_start: number;
  page_end: number;
  status?: ExamStatus; // Optional for backward compatibility
  result?: number; // From POST /api/exams/ response
  num_questions: number;
  created_at: string;
  questions?: ExamQuestionResponse[]; // Questions included in POST /api/exams/ response
}

export type QuestionDifficulty = 'facil' | 'medio' | 'dificil' | 'easy' | 'medium' | 'hard';

export interface DjangoQuestion {
  id?: number;
  exam?: number;
  question: string;
  options: Record<string, unknown> | Array<{ text: string; isCorrect: boolean }>;
  difficulty: QuestionDifficulty;
  created_at?: string;
}

export interface DjangoAttempt {
  id: number;
  exam: number;
  user: number;
  score: number;
  total_questions: number;
  answers: Record<string, unknown>;
  started_at: string;
  completed_at: string;
  created_at: string;
}

export interface PaginatedExamList {
  count: number;
  next: string | null;
  previous: string | null;
  results: DjangoExam[];
}

export interface PaginatedExamAttemptList {
  count: number;
  next: string | null;
  previous: string | null;
  results: DjangoAttempt[];
}

/**
 * Tipo para las preguntas que vienen del endpoint POST /api/exams/
 * (estructura diferente a DjangoQuestion del GET /api/questions/)
 */
export interface ExamQuestionResponse {
  question: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * Tipos extendidos para UI
 */
export type DocumentProcessingStatus = 'processing' | 'ready' | 'failed';

export interface DocumentWithExams extends DjangoDocument {
  exams: DjangoExam[];
  examCount: number;
  processingStatus: DocumentProcessingStatus;
}

/**
 * Request/Response types
 */
export interface UploadDocumentResponse {
  data: DjangoDocument;
  message: string;
  status: string;
}

export interface CreateExamRequest {
  document: number;
  page_start: number;
  page_end: number;
  num_questions?: number;
}

/**
 * Aliases para compatibilidad con código legacy que usa "External" prefix
 * Django es la fuente de verdad - estos aliases permiten migración gradual
 * 
 * @deprecated Preferir usar Django* types directamente
 * TODO: Migrar todo el código para usar Django* directamente y eliminar estos aliases
 */
export type ExternalDocument = DjangoDocument;
export type ExternalExam = DjangoExam;
export type ExternalQuestion = DjangoQuestion;
export type ExternalDifficulty = QuestionDifficulty;

/**
 * Estructura de opciones para compatibilidad
 */
export interface ExternalQuestionOptions {
  [key: string]: string | boolean | unknown;
}
