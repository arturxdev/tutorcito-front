/**
 * Utilidades para determinar el estado de procesamiento de documentos
 */

import type { DjangoDocument, DjangoExam, DocumentProcessingStatus } from '@/types/django-api';

/**
 * Determina el estado de procesamiento de un documento basado en sus exámenes
 * 
 * Lógica:
 * - Si tiene exams con status 'done' → ready
 * - Si tiene exams con status 'fail' → failed
 * - Si tiene exams con status 'process' → processing
 * - Si no tiene exams y fue creado hace < 5 min → processing
 * - Por defecto → ready
 */
export function getDocumentProcessingStatus(
  document: DjangoDocument,
  exams: DjangoExam[]
): DocumentProcessingStatus {
  // Si tiene exams completados, está listo
  if (exams.some(exam => exam.status === 'done')) {
    return 'ready';
  }
  
  // Si tiene exams fallidos, falló
  if (exams.some(exam => exam.status === 'fail')) {
    return 'failed';
  }
  
  // Si tiene exams procesando, está procesando
  if (exams.some(exam => exam.status === 'process')) {
    return 'processing';
  }
  
  // Si no tiene exams pero fue creado recientemente, asumimos procesando
  const createdAt = new Date(document.created_at);
  const now = new Date();
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  
  if (diffMinutes < 5) {
    return 'processing';
  }
  
  // Por defecto, listo (documento cargado sin exams)
  return 'ready';
}

/**
 * Obtiene el badge apropiado para el estado
 */
export function getStatusBadge(status: DocumentProcessingStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case 'processing':
      return {
        label: 'Procesando',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        icon: '🟡',
      };
    case 'ready':
      return {
        label: 'Listo',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        icon: '🟢',
      };
    case 'failed':
      return {
        label: 'Fallido',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
        icon: '🔴',
      };
  }
}

/**
 * Formatea el tamaño del archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
