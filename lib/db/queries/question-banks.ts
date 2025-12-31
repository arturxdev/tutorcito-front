import { db, QuestionBank, NewQuestionBank } from '../index';
import { questionBanks, questions } from '../schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Crear un nuevo banco de preguntas
 */
export async function createQuestionBank(data: NewQuestionBank): Promise<QuestionBank> {
  const [bank] = await db.insert(questionBanks).values(data).returning();
  return bank;
}

/**
 * Obtener todos los bancos de un usuario
 */
export async function getQuestionBanksByUserId(userId: string) {
  return await db
    .select()
    .from(questionBanks)
    .where(eq(questionBanks.userId, userId))
    .orderBy(desc(questionBanks.createdAt));
}

/**
 * Obtener un banco con sus preguntas y respuestas
 */
export async function getQuestionBankWithQuestions(bankId: string, userId: string) {
  return await db.query.questionBanks.findFirst({
    where: and(
      eq(questionBanks.id, bankId),
      eq(questionBanks.userId, userId)
    ),
    with: {
      questions: {
        with: {
          answers: {
            orderBy: (answers, { asc }) => [asc(answers.displayOrder)],
          },
        },
        orderBy: (questions, { asc }) => [asc(questions.createdAt)],
      },
    },
  });
}

/**
 * Obtener un banco sin preguntas (solo metadata)
 */
export async function getQuestionBank(bankId: string, userId: string) {
  return await db.query.questionBanks.findFirst({
    where: and(
      eq(questionBanks.id, bankId),
      eq(questionBanks.userId, userId)
    ),
  });
}

/**
 * Actualizar un banco de preguntas
 */
export async function updateQuestionBank(
  bankId: string,
  userId: string,
  data: Partial<NewQuestionBank>
) {
  const [updated] = await db
    .update(questionBanks)
    .set({ ...data, updatedAt: new Date() })
    .where(and(
      eq(questionBanks.id, bankId),
      eq(questionBanks.userId, userId)
    ))
    .returning();
  return updated;
}

/**
 * Eliminar un banco de preguntas (cascade a preguntas y respuestas)
 */
export async function deleteQuestionBank(bankId: string, userId: string) {
  await db
    .delete(questionBanks)
    .where(and(
      eq(questionBanks.id, bankId),
      eq(questionBanks.userId, userId)
    ));
}

/**
 * Actualizar contadores de preguntas de un banco
 */
export async function updateQuestionBankCounts(bankId: string) {
  const questionsCount = await db
    .select()
    .from(questions)
    .where(eq(questions.bankId, bankId));

  const easy = questionsCount.filter(q => q.difficulty === 'easy').length;
  const medium = questionsCount.filter(q => q.difficulty === 'medium').length;
  const hard = questionsCount.filter(q => q.difficulty === 'hard').length;

  await db
    .update(questionBanks)
    .set({
      totalQuestions: questionsCount.length,
      easyCount: easy,
      mediumCount: medium,
      hardCount: hard,
      updatedAt: new Date(),
    })
    .where(eq(questionBanks.id, bankId));
}

/**
 * Verificar si un banco pertenece a un usuario
 */
export async function verifyBankOwnership(bankId: string, userId: string): Promise<boolean> {
  const bank = await db.query.questionBanks.findFirst({
    where: and(
      eq(questionBanks.id, bankId),
      eq(questionBanks.userId, userId)
    ),
  });
  return !!bank;
}
