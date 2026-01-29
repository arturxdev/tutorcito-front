/**
 * Cliente API para el backend Django
 * Este archivo puede ser usado tanto en server como en client components
 */

import type {
  DjangoExam,
  DjangoQuestion,
  DjangoAttempt,
  CreateExamRequest,
} from '@/types/django-api';
import type { CreateAttemptRequest, DjangoAttemptResponse } from '@/types/quiz';
import { redirect } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Variable global para almacenar la función getToken
let tokenGetter: (() => Promise<string | null>) | null = null;

/**
 * Configura la función para obtener tokens (debe ser llamada desde un componente cliente)
 */
export function setTokenGetter(getter: () => Promise<string | null>) {
  tokenGetter = getter;
}

/**
 * Obtiene el token usando la función configurada o el token pasado directamente
 */
async function getToken(directToken?: string | null): Promise<string | null> {
  // Si se pasa un token directamente (desde Server Component), usarlo
  if (directToken !== undefined) {
    return directToken;
  }

  // Si no, usar el tokenGetter (desde Client Component)
  if (tokenGetter) {
    return await tokenGetter();
  }

  return null;
}

/**
 * Fetch wrapper con autenticación automática
 * @param url - URL del endpoint
 * @param options - Opciones de fetch
 * @param token - Token opcional para Server Components (usa auth().getToken())
 */
async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  token?: string | null
) {

  const authToken = await getToken(token);

  if (!authToken) {
    // Si estamos en servidor, redirigir con next/navigation
    if (typeof window === 'undefined') {
      console.error('❌ [Django API] Server-side: Redirecting to sign-in...');
      redirect('/sign-in');
    }

    // Si estamos en cliente, usar window.location
    console.error('❌ [Django API] Client-side: Redirecting to sign-in...');
    window.location.href = '/sign-in';
    throw new Error('No authentication token available');
  }

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  headers['Authorization'] = `Bearer ${authToken}`;

  console.log('📡 [Django API] Request headers:', Object.keys(headers));

  const response = await fetch(url, { ...options, headers });


  if (response.status === 401) {
    console.error('❌ [Django API] Unauthorized (401) - Token invalid or expired');

    // Si estamos en servidor, redirigir con next/navigation
    if (typeof window === 'undefined') {
      console.error('❌ [Django API] Server-side: Redirecting to sign-in...');
      redirect('/sign-in');
    }

    // Si estamos en cliente, usar window.location
    console.error('❌ [Django API] Client-side: Redirecting to sign-in...');
    window.location.href = '/sign-in';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Django API] Request failed');
    console.error('❌ [Django API] Status:', response.status);
    console.error('❌ [Django API] Response body:', errorText);
  }

  return response;
}



/**
 * EXÁMENES
 */

/**
 * Obtiene todos los exámenes del usuario, opcionalmente filtrados por documento
 * @param documentId - ID del documento para filtrar (opcional)
 * @param token - Token opcional para Server Components
 */
export async function getExams(documentId?: number, token?: string | null): Promise<DjangoExam[]> {
  const url = documentId
    ? `${API_BASE_URL}/api/exams/?document=${documentId}`
    : `${API_BASE_URL}/api/exams/`;

  const response = await authenticatedFetch(url, {}, token);

  if (!response.ok) {
    throw new Error('Error al obtener exámenes');
  }

  const data = await response.json();

  // Handle paginated response - extract results array
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }

  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }

  console.error('❌ [Django API] Unexpected response format from /api/exams/', data);
  return [];
}

/**
 * Obtiene un examen por ID
 * @param token - Token opcional para Server Components
 */
export async function getExamById(id: number, token?: string | null): Promise<DjangoExam> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/${id}`, {}, token);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Examen no encontrado');
    }
    throw new Error('Error al obtener examen');
  }

  return response.json();
}

/**
 * Crea un nuevo examen
 * @param token - Token opcional para Server Components
 */
export async function createExam(data: CreateExamRequest, token?: string | null): Promise<DjangoExam> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, token);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error al crear examen' }));
    throw new Error(error.error || 'Error al crear examen');
  }

  return response.json();
}

/**
 * Actualiza un examen
 * @param token - Token opcional para Server Components
 */
export async function updateExam(
  id: number,
  data: Partial<DjangoExam>,
  token?: string | null
): Promise<DjangoExam> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, token);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Examen no encontrado');
    }
    const error = await response.json().catch(() => ({ error: 'Error al actualizar examen' }));
    throw new Error(error.error || 'Error al actualizar examen');
  }

  return response.json();
}

/**
 * Elimina un examen
 * @param token - Token opcional para Server Components
 */
export async function deleteExam(id: number, token?: string | null): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/${id}`, {
    method: 'DELETE',
  }, token);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Examen no encontrado');
    }
    throw new Error('Error al eliminar examen');
  }
}

/**
 * Guarda un intento de examen
 * @param examId - ID del examen en Django
 * @param attemptData - Datos del intento (score, answers, etc.)
 * @param token - Token opcional para Server Components
 */
export async function createExamAttempt(
  examId: number,
  attemptData: CreateAttemptRequest,
  token?: string | null
): Promise<DjangoAttemptResponse> {
  console.log('💾 [Django API] Guardando intento de examen');
  console.log('💾 [Django API] Exam ID:', examId);
  console.log('💾 [Django API] Score:', attemptData.score, '/', attemptData.total_questions);

  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/${examId}/attempts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attemptData),
  }, token);

  if (!response.ok) {
    console.error('❌ [Django API] Error guardando intento');
    const error = await response.json().catch(() => ({ error: 'Error al guardar intento' }));
    throw new Error(error.error || 'Error al guardar intento');
  }

  console.log('✅ [Django API] Intento guardado exitosamente');
  return response.json();
}

/**
 * Obtiene todos los intentos de exámenes del usuario
 * @param token - Token opcional para Server Components
 */
export async function getExamAttempts(token?: string | null): Promise<DjangoAttempt[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/attempts/`, {}, token);

  if (!response.ok) {
    throw new Error('Error al obtener intentos');
  }

  const data = await response.json();

  // Handle paginated response - extract results array
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }

  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }

  console.error('❌ [Django API] Unexpected response format from /api/exams/attempts/', data);
  return [];
}

/**
 * Obtiene los intentos de un examen específico
 * @param examId - ID del examen
 * @param token - Token opcional para Server Components
 */
export async function getAttemptsByExam(examId: number, token?: string | null): Promise<DjangoAttempt[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/exams/attempts/?exam=${examId}`, {}, token);

  if (!response.ok) {
    throw new Error('Error al obtener intentos del examen');
  }

  const data = await response.json();

  // Handle paginated response - extract results array
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }

  // If it's already an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }

  console.error('❌ [Django API] Unexpected response format from /api/exams/attempts/', data);
  return [];
}

/**
 * PREGUNTAS
 */

/**
 * Obtiene las preguntas de un examen
 * @param token - Token opcional para Server Components
 */
export async function getQuestionsByExam(examId: number, token?: string | null): Promise<DjangoQuestion[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/questions/?exam=${examId}`, {}, token);

  if (!response.ok) {
    throw new Error('Error al obtener preguntas');
  }

  return response.json();
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Filtra exámenes por documento (utility function)
 * Esta es una función helper local que no hace requests HTTP
 */
export function getExamsByDocument(
  exams: DjangoExam[],
  documentId: number
): DjangoExam[] {
  return exams.filter(exam => exam.document === documentId);
}
