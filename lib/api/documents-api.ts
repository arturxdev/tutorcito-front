/**
 * API de documentos con abstracción de Question Banks
 * Esta capa proporciona una interfaz de "Question Banks" sobre el backend Django
 */

import {
  getExams,
  createExam,
  getQuestionsByExam,
} from './django-api';
import type { QuestionBank, QuestionBankWithQuestions } from '@/types/question-bank';
import type { DjangoQuestion } from '@/types/django-api';
import { mapToQuestionBank, mapToQuestionBankWithQuestions } from '@/lib/mappers/question-bank-mapper';
import { getDocumentById } from '@/src/entities';


/**
 * Obtiene un banco de preguntas por ID con todas sus preguntas
 * @param token - Token opcional para Server Components
 */
export async function getQuestionBankById(id: string, token?: string | null): Promise<QuestionBankWithQuestions> {
  console.log(`📚 [Documents API] Getting question bank ${id}`);

  const documentId = parseInt(id, 10);

  // 1. Obtener el documento
  const document = await getDocumentById(documentId, token);

  // 2. Obtener exams de este documento
  const exams = await getExams(documentId, token);

  if (exams.length === 0) {
    // No hay exams, retornar banco vacío
    return mapToQuestionBankWithQuestions(document, {
      id: 0,
      document: documentId,
      user: 0,
      page_start: 1,
      page_end: document.num_pages,
      num_questions: 0,
      created_at: document.created_at.toISOString(),
      status: 'done',
    }, []);
  }

  // 3. Tomar el primer exam como principal
  const primaryExam = exams[0];

  console.log(`✅ [Documents API] Found bank ${id} with exam ${primaryExam.id}`);

  // 4. Mapear y retornar (sin cargar preguntas por ahora - el endpoint no existe)
  return mapToQuestionBankWithQuestions(document, primaryExam, []);
}


/**
 * Regenera las preguntas de un banco
 * Crea un nuevo exam para el mismo documento
 * @param token - Token opcional para Server Components
 */
export async function regenerateQuestions(
  id: string,
  params: {
    page_start?: number;
    page_end?: number;
    num_questions?: number;
  },
  token?: string | null
): Promise<QuestionBankWithQuestions> {
  console.log(`📚 [Documents API] Regenerating questions for bank ${id}`);

  const documentId = parseInt(id, 10);

  // 1. Obtener el documento
  const document = await getDocumentById(documentId, token);

  // 2. Crear un nuevo exam (esto generará nuevas preguntas)
  const newExam = await createExam({
    document: documentId,
    page_start: params.page_start ?? 1,
    page_end: params.page_end ?? document.num_pages,
    num_questions: params.num_questions ?? 10,
  }, token);

  // 3. Obtener las nuevas preguntas
  const questions = await getQuestionsByExam(newExam.id, token);

  console.log(`✅ [Documents API] Regenerated ${questions.length} questions`);

  // 4. Mapear y retornar
  return mapToQuestionBankWithQuestions(document, newExam, questions);
}

/**
 * Añade más preguntas a un banco existente
 * Crea un nuevo exam adicional
 * @param token - Token opcional para Server Components
 */
export async function addQuestions(
  id: string,
  params: {
    page_start?: number;
    page_end?: number;
    num_questions?: number;
  },
  token?: string | null
): Promise<QuestionBankWithQuestions> {
  console.log(`📚 [Documents API] Adding questions to bank ${id}`);

  // Por ahora, esto es lo mismo que regenerar
  // En el futuro podríamos combinar preguntas de múltiples exams
  return regenerateQuestions(id, params, token);
}
