import {
  ExternalDocument,
  ExternalExam,
  ExternalQuestion,
} from '@/types/external-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * GET /api/documents/
 * Obtiene todos los documentos disponibles
 */
export async function getDocuments(): Promise<ExternalDocument[]> {
  const response = await fetch(`${API_BASE_URL}/api/documents/`);

  if (!response.ok) {
    throw new Error(`Error fetching documents: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/exams/
 * Obtiene todos los exámenes disponibles
 */
export async function getExams(): Promise<ExternalExam[]> {
  const response = await fetch(`${API_BASE_URL}/api/exams/`);

  if (!response.ok) {
    throw new Error(`Error fetching exams: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Filtra exámenes por document_id
 */
export function getExamsByDocument(
  exams: ExternalExam[],
  documentId: number
): ExternalExam[] {
  return exams.filter(exam => exam.document_id === documentId);
}

/**
 * GET /api/questions/?exam_id={examId}
 * Obtiene las preguntas de un examen específico
 */
export async function getQuestionsByExam(examId: number): Promise<ExternalQuestion[]> {
  const response = await fetch(`${API_BASE_URL}/api/questions/?exam=${examId}`);

  if (!response.ok) {
    throw new Error(`Error fetching questions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/documents/{id}/
 * Obtiene un documento específico por ID
 */
export async function getDocumentById(documentId: number): Promise<ExternalDocument> {
  const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/`);

  if (!response.ok) {
    throw new Error(`Error fetching document: ${response.statusText}`);
  }

  return response.json();
}

/**
 * GET /api/exams/{id}
 * Obtiene un examen específico por ID
 */
export async function getExamById(examId: number): Promise<ExternalExam> {
  const response = await fetch(`${API_BASE_URL}/api/exams/${examId}`);

  if (!response.ok) {
    throw new Error(`Error fetching exam: ${response.statusText}`);
  }

  return response.json();
}
