/**
 * Cliente API para el backend Django
 * Este archivo puede ser usado tanto en server como en client components
 */

import type {
  DjangoDocument,
  DjangoExam,
  DjangoQuestion,
  UploadDocumentResponse,
  CreateExamRequest,
} from '@/types/django-api';
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
  console.log('📡 [Django API] Making authenticated request');
  console.log('📡 [Django API] URL:', url);
  console.log('📡 [Django API] Method:', options.method || 'GET');
  
  const authToken = await getToken(token);
  
  if (!authToken) {
    console.error('❌ [Django API] No token available - cannot make authenticated request');
    
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
  
  console.log('🔐 [Django API] Adding Authorization header with token');
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  
  headers['Authorization'] = `Bearer ${authToken}`;
  
  console.log('📡 [Django API] Request headers:', Object.keys(headers));
  
  const response = await fetch(url, { ...options, headers });
  
  console.log('📡 [Django API] Response received');
  console.log('📡 [Django API] Status:', response.status, response.statusText);
  console.log('📡 [Django API] Status OK:', response.ok);
  
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
  } else {
    console.log('✅ [Django API] Request successful');
  }
  
  return response;
}

/**
 * DOCUMENTOS
 */

/**
 * Sube un documento PDF al backend
 * @param file - Archivo PDF a subir
 * @param token - Token opcional para Server Components
 */
export async function uploadDocument(file: File, token?: string | null): Promise<DjangoDocument> {
  console.log('📤 [UPLOAD] Starting document upload');
  console.log('📤 [UPLOAD] File name:', file.name);
  console.log('📤 [UPLOAD] File size:', file.size, 'bytes', `(${(file.size / 1024).toFixed(2)} KB)`);
  console.log('📤 [UPLOAD] File type:', file.type);
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('📤 [UPLOAD] FormData prepared, making request...');
  
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/upload/`, {
    method: 'POST',
    body: formData,
  }, token);
  
  if (!response.ok) {
    console.error('❌ [UPLOAD] Upload failed');
    console.error('❌ [UPLOAD] Status:', response.status, response.statusText);
    
    const error = await response.json().catch(() => ({ error: 'Error al subir documento' }));
    console.error('❌ [UPLOAD] Error response:', error);
    
    throw new Error(error.error || 'Error al subir documento');
  }
  
  console.log('✅ [UPLOAD] Upload successful!');
  
  const data: UploadDocumentResponse = await response.json();
  console.log('✅ [UPLOAD] Document created:', {
    id: data.data.id,
    name: data.data.name,
    pages: data.data.num_pages,
  });
  
  return data.data;
}

/**
 * Obtiene todos los documentos del usuario
 * @param token - Token opcional para Server Components
 */
export async function getDocuments(token?: string | null): Promise<DjangoDocument[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/`, {}, token);
  
  if (!response.ok) {
    throw new Error('Error al obtener documentos');
  }
  
  return response.json();
}

/**
 * Obtiene un documento por ID
 * @param token - Token opcional para Server Components
 */
export async function getDocumentById(id: number, token?: string | null): Promise<DjangoDocument> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/${id}/`, {}, token);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Documento no encontrado');
    }
    throw new Error('Error al obtener documento');
  }
  
  return response.json();
}

/**
 * Actualiza un documento (nombre, etc)
 * @param token - Token opcional para Server Components
 */
export async function updateDocument(
  id: number, 
  data: Partial<Pick<DjangoDocument, 'name'>>,
  token?: string | null
): Promise<DjangoDocument> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }, token);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Documento no encontrado');
    }
    const error = await response.json().catch(() => ({ error: 'Error al actualizar documento' }));
    throw new Error(error.error || 'Error al actualizar documento');
  }
  
  return response.json();
}

/**
 * Elimina un documento
 * @param token - Token opcional para Server Components
 */
export async function deleteDocument(id: number, token?: string | null): Promise<void> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/documents/${id}/`, {
    method: 'DELETE',
  }, token);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Documento no encontrado');
    }
    throw new Error('Error al eliminar documento');
  }
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
  
  return response.json();
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
