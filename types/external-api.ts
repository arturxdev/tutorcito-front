// Tipos basados en el schema OpenAPI de la API externa

export interface ExternalDocument {
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

export interface ExternalExam {
  id: number;
  page_start: number;
  page_end: number;
  status: ExamStatus;
  num_questions: number;
  created_at: string;
  document: number;
  user: number;
}

export type ExternalDifficulty = 'facil' | 'medio' | 'dificil';

// Estructura de opciones - será un objeto con las respuestas y la correcta
export interface ExternalQuestionOptions {
  [key: string]: string | boolean | any;
}

export interface ExternalQuestion {
  id: number;
  question: string;
  options: ExternalQuestionOptions;
  difficulty: ExternalDifficulty;
  created_at: string;
  exam: number;
}
