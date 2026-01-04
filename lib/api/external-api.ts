import {
  ExternalDocument,
  ExternalExam,
  ExternalQuestion,
} from '@/types/external-api';
import { getSupabaseToken } from '@/lib/supabase/get-token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Fetch wrapper que incluye automáticamente el token de autenticación
 */
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = await getSupabaseToken();
  
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token expirado, redirigir a login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  
  return response;
}

/**
 * GET /api/documents/
 * Obtiene todos los documentos disponibles
 */
export async function getDocuments(): Promise<ExternalDocument[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/`);

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
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/`);

  if (!response.ok) {
    throw new Error(`Error fetching exams: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Filtra exámenes por document
 */
export function getExamsByDocument(
  exams: ExternalExam[],
  documentId: number
): ExternalExam[] {
  return exams.filter(exam => exam.document === documentId);
}

/**
 * GET /api/questions/?exam_id={examId}
 * Obtiene las preguntas de un examen específico
 */
export async function getQuestionsByExam(examId: number): Promise<ExternalQuestion[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/?exam=${examId}`);

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
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/${documentId}/`);

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
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/${examId}`);

  if (!response.ok) {
    throw new Error(`Error fetching exam: ${response.statusText}`);
  }

  return response.json();
}
