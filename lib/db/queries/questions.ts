import { db, Question, NewQuestion, Answer, NewAnswer } from '../index';
import { questions, answers } from '../schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * Crear una pregunta
 */
export async function createQuestion(data: NewQuestion): Promise<Question> {
  const [question] = await db.insert(questions).values(data).returning();
  return question;
}

/**
 * Crear múltiples preguntas en batch
 */
export async function createQuestions(data: NewQuestion[]): Promise<Question[]> {
  return await db.insert(questions).values(data).returning();
}

/**
 * Crear una respuesta
 */
export async function createAnswer(data: NewAnswer): Promise<Answer> {
  const [answer] = await db.insert(answers).values(data).returning();
  return answer;
}

/**
 * Crear múltiples respuestas en batch
 */
export async function createAnswers(data: NewAnswer[]): Promise<Answer[]> {
  return await db.insert(answers).values(data).returning();
}

/**
 * Obtener preguntas de un banco por dificultad
 */
export async function getQuestionsByDifficulty(
  bankId: string,
  difficulty: 'easy' | 'medium' | 'hard'
) {
  return await db.query.questions.findMany({
    where: eq(questions.bankId, bankId) && eq(questions.difficulty, difficulty),
    with: {
      answers: {
        orderBy: (answers, { asc }) => [asc(answers.displayOrder)],
      },
    },
  });
}

/**
 * Eliminar preguntas específicas (cascade a respuestas)
 */
export async function deleteQuestions(questionIds: string[]) {
  await db.delete(questions).where(inArray(questions.id, questionIds));
}

/**
 * Obtener preguntas aleatorias de un banco
 */
export async function getRandomQuestions(
  bankId: string,
  easyCount: number,
  mediumCount: number,
  hardCount: number
) {
  // Obtener preguntas por dificultad
  const easyQuestions = await db.query.questions.findMany({
    where: eq(questions.bankId, bankId) && eq(questions.difficulty, 'easy'),
    with: {
      answers: {
        orderBy: (answers, { asc }) => [asc(answers.displayOrder)],
      },
    },
  });

  const mediumQuestions = await db.query.questions.findMany({
    where: eq(questions.bankId, bankId) && eq(questions.difficulty, 'medium'),
    with: {
      answers: {
        orderBy: (answers, { asc }) => [asc(answers.displayOrder)],
      },
    },
  });

  const hardQuestions = await db.query.questions.findMany({
    where: eq(questions.bankId, bankId) && eq(questions.difficulty, 'hard'),
    with: {
      answers: {
        orderBy: (answers, { asc }) => [asc(answers.displayOrder)],
      },
    },
  });

  // Shuffle y seleccionar cantidad requerida
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const selectedEasy = shuffleArray(easyQuestions).slice(0, easyCount);
  const selectedMedium = shuffleArray(mediumQuestions).slice(0, mediumCount);
  const selectedHard = shuffleArray(hardQuestions).slice(0, hardCount);

  return shuffleArray([...selectedEasy, ...selectedMedium, ...selectedHard]);
}
