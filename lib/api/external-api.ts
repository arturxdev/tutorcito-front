/**
 * @deprecated Este archivo está deprecado. Usar '@/lib/api/django-api' en su lugar.
 * 
 * Django es la fuente de verdad para todo el proyecto.
 * Este archivo se mantendrá temporalmente para compatibilidad pero será eliminado pronto.
 * 
 * Migración:
 * - ExternalDocument → DjangoDocument (ya disponible como alias)
 * - ExternalExam → DjangoExam (ya disponible como alias)
 * - ExternalQuestion → DjangoQuestion (ya disponible como alias)
 * - getDocuments() → importar de '@/lib/api/django-api'
 * - getExams() → importar de '@/lib/api/django-api'
 * - getQuestionsByExam() → importar de '@/lib/api/django-api'
 * - getDocumentById() → importar de '@/lib/api/django-api'
 * - getExamById() → importar de '@/lib/api/django-api'
 * - getExamsByDocument() → importar de '@/lib/api/django-api'
 * 
 * Todas las funciones ahora están disponibles en django-api.ts
 */

// Re-exportar todo desde django-api para compatibilidad temporal
export {
  getDocuments,
  getExams,
  getExamsByDocument,
  getQuestionsByExam,
  getDocumentById,
  getExamById,
  uploadDocument,
  createExam,
} from '@/lib/api/django-api';

// Re-exportar tipos con aliases para compatibilidad
export type {
  ExternalDocument,
  ExternalExam,
  ExternalQuestion,
  ExternalDifficulty,
  ExternalQuestionOptions,
} from '@/types/django-api';
