/**
 * API de documentos con abstracción de Question Banks
 * Esta capa proporciona una interfaz de "Question Banks" sobre el backend Django
 */

import {
  getDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  deleteDocument,
  getExams,
  getExamById,
  createExam,
  deleteExam,
  getQuestionsByExam,
} from './django-api';
import type { QuestionBank, QuestionBankWithQuestions } from '@/types/question-bank';
import { mapToQuestionBank, mapToQuestionBankWithQuestions } from '@/lib/mappers/question-bank-mapper';

/**
 * Obtiene todos los bancos de preguntas del usuario
 * Mapea Documents + Exams a QuestionBanks
 * @param token - Token opcional para Server Components (usa auth().getToken())
 */
export async function getQuestionBanks(token?: string | null): Promise<QuestionBank[]> {
  console.log('📚 [Documents API] Getting all question banks');
  
  // 1. Obtener todos los documentos del usuario
  const documents = await getDocuments(token);
  console.log(`📚 [Documents API] Found ${documents.length} documents`);
  
  // 2. Obtener todos los exámenes del usuario
  const allExams = await getExams(undefined, token);
  console.log(`📚 [Documents API] Found ${allExams.length} exams`);
  
  // 3. Para cada documento, encontrar su exam principal y sus preguntas
  const banks = await Promise.all(
    documents.map(async (doc) => {
      // Encontrar exams de este documento
      const docExams = allExams.filter(e => e.document === doc.id);
      
      // Tomar el primer exam como "principal" (podría ser el más reciente en el futuro)
      const primaryExam = docExams.length > 0 ? docExams[0] : null;
      
      // Si hay exam, obtener sus preguntas
      let questions: any[] = [];
      if (primaryExam) {
        try {
          questions = await getQuestionsByExam(primaryExam.id, token);
        } catch (error) {
          console.error(`❌ Error getting questions for exam ${primaryExam.id}:`, error);
          // Continuar con array vacío si falla
        }
      }
      
      // Mapear a QuestionBank
      return mapToQuestionBank(doc, primaryExam, questions);
    })
  );
  
  console.log(`✅ [Documents API] Mapped ${banks.length} question banks`);
  return banks;
}

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
      created_at: document.created_at,
      status: 'done',
    }, []);
  }
  
  // 3. Tomar el primer exam como principal
  const primaryExam = exams[0];
  
  // 4. Obtener preguntas del exam
  const questions = await getQuestionsByExam(primaryExam.id, token);
  
  console.log(`✅ [Documents API] Found ${questions.length} questions for bank ${id}`);
  
  // 5. Mapear y retornar
  return mapToQuestionBankWithQuestions(document, primaryExam, questions);
}

/**
 * Crea un nuevo banco de preguntas
 * Sube el PDF, crea el documento, crea un exam y genera preguntas
 * @param token - Token opcional para Server Components
 */
export async function createQuestionBank(
  params: {
    file: File;
    name?: string;
    page_start?: number;
    page_end?: number;
    num_questions?: number;
  },
  token?: string | null
): Promise<QuestionBank> {
  console.log('📚 [Documents API] Creating new question bank');
  console.log('📚 [Documents API] File:', params.file.name);
  console.log('📚 [Documents API] Custom name:', params.name);
  console.log('📚 [Documents API] Num questions:', params.num_questions);
  
  // 1. Upload PDF
  const document = await uploadDocument(params.file, token);
  console.log(`✅ [Documents API] Document uploaded: ${document.id}`);
  
  // 2. Actualizar nombre si se proveyó y es diferente del archivo
  if (params.name && params.name !== params.file.name) {
    await updateDocument(document.id, { name: params.name }, token);
    document.name = params.name;
    console.log(`✅ [Documents API] Document name updated: ${params.name}`);
  }
  
  // 3. Crear exam (Django generará las preguntas automáticamente con Groq)
  const exam = await createExam({
    document: document.id,
    page_start: params.page_start ?? 1,
    page_end: params.page_end ?? document.num_pages,
    num_questions: params.num_questions ?? 10,
  }, token);
  console.log(`✅ [Documents API] Exam created: ${exam.id}`);
  
  // 4. Obtener las preguntas generadas
  const questions = await getQuestionsByExam(exam.id, token);
  console.log(`✅ [Documents API] Got ${questions.length} generated questions`);
  
  // 5. Mapear y retornar
  const bank = mapToQuestionBank(document, exam, questions);
  console.log(`✅ [Documents API] Question bank created successfully: ${bank.id}`);
  
  return bank;
}

/**
 * Actualiza el nombre de un banco de preguntas
 * @param token - Token opcional para Server Components
 */
export async function updateQuestionBank(
  id: string,
  data: { name?: string },
  token?: string | null
): Promise<QuestionBank> {
  console.log(`📚 [Documents API] Updating question bank ${id}`);
  
  const documentId = parseInt(id, 10);
  
  // Actualizar documento
  const document = await updateDocument(documentId, data, token);
  
  // Obtener exam y preguntas para mapear
  const exams = await getExams(documentId, token);
  const primaryExam = exams.length > 0 ? exams[0] : null;
  
  let questions: any[] = [];
  if (primaryExam) {
    questions = await getQuestionsByExam(primaryExam.id, token);
  }
  
  return mapToQuestionBank(document, primaryExam, questions);
}

/**
 * Elimina un banco de preguntas (elimina el documento, lo cual cascadea a exams y questions)
 * @param token - Token opcional para Server Components
 */
export async function deleteQuestionBank(id: string, token?: string | null): Promise<void> {
  console.log(`📚 [Documents API] Deleting question bank ${id}`);
  
  const documentId = parseInt(id, 10);
  await deleteDocument(documentId, token);
  
  console.log(`✅ [Documents API] Question bank ${id} deleted`);
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
