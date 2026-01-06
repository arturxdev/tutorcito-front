/**
 * @deprecated Usar '@/types/django-api' en su lugar.
 * 
 * Este archivo se mantiene solo para compatibilidad temporal.
 * Django es la fuente de verdad para todo el proyecto.
 * 
 * Migración:
 * - ExternalDocument → DjangoDocument
 * - ExternalExam → DjangoExam
 * - ExternalQuestion → DjangoQuestion
 * - ExternalDifficulty → QuestionDifficulty
 * 
 * Todos estos tipos ya están disponibles como aliases en '@/types/django-api'
 */

// Re-exportar tipos desde django-api para compatibilidad
export type {
  ExternalDocument,
  ExternalExam,
  ExternalQuestion,
  ExternalDifficulty,
  ExternalQuestionOptions,
  DjangoDocument,
  DjangoExam,
  DjangoQuestion,
  QuestionDifficulty,
  ExamStatus,
  DocumentProcessingStatus,
  DocumentWithExams,
  UploadDocumentResponse,
  CreateExamRequest,
} from '@/types/django-api';
