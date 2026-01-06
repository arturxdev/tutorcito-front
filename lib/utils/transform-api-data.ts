import { nanoid } from 'nanoid';
import {
  DjangoQuestion,
  QuestionDifficulty,
  DjangoExam,
  DjangoDocument,
} from '@/types/django-api';
import {
  Question,
  Answer,
  Difficulty,
  GeneratedQuiz,
} from '@/types/quiz';

/**
 * Mapea la dificultad de Django al formato interno del quiz
 * Soporta tanto español ('facil', 'medio', 'dificil') como inglés ('easy', 'medium', 'hard')
 */
function mapDifficulty(djangoDiff: QuestionDifficulty): Difficulty {
  const difficultyMap: Record<string, Difficulty> = {
    'facil': 'easy',
    'medio': 'medium',
    'dificil': 'hard',
    'easy': 'easy',
    'medium': 'medium',
    'hard': 'hard',
  };

  return difficultyMap[djangoDiff] || 'medium';
}

/**
 * Convierte las opciones de la API externa al formato interno de Answer[]
 *
 * La estructura esperada de options puede variar:
 * - Si es un objeto con claves y un campo 'correct_answer'
 * - Si es un array de objetos con { text, isCorrect }
 *
 * Esta función intentará manejar ambos casos
 */
function parseOptions(options: any, questionIndex: number): { answers: Answer[], correctAnswerId: string } {
  // Caso 1: Array de opciones con isCorrect (nuevo formato del backend)
  if (Array.isArray(options)) {
    const answers: Answer[] = options.map((opt, index) => {
      // Generar ID único para cada respuesta
      const answerId = `q${questionIndex}-a${index}`;
      return {
        id: answerId,
        text: opt.text || opt.answer || String(opt),
        isCorrect: opt.isCorrect || opt.is_correct || false,
      };
    });

    const correctAnswer = answers.find(a => a.isCorrect);
    const correctAnswerId = correctAnswer?.id || answers[0]?.id || '';

    return { answers, correctAnswerId };
  }

  // Caso 2: Objeto con claves y posible campo correct_answer
  if (typeof options === 'object' && options !== null) {
    const correctAnswerKey = options.correct_answer || options.correctAnswer;
    const answers: Answer[] = [];

    // Filtrar las claves que no son metadata
    const optionKeys = Object.keys(options).filter(
      key => !['correct_answer', 'correctAnswer', 'explanation'].includes(key)
    );

    optionKeys.forEach((key, index) => {
      answers.push({
        id: `q${questionIndex}-a${index}`,
        text: String(options[key]),
        isCorrect: key === correctAnswerKey,
      });
    });

    // Si no hay respuestas generadas, intentar otra estructura
    if (answers.length === 0) {
      // Caso de emergencia: convertir todo a respuestas
      Object.entries(options).forEach(([key, value], index) => {
        if (typeof value === 'string') {
          answers.push({
            id: `q${questionIndex}-a${index}`,
            text: value,
            isCorrect: index === 0, // Por defecto la primera es correcta
          });
        }
      });
    }

    const correctAnswerId = correctAnswerKey || answers.find(a => a.isCorrect)?.id || answers[0]?.id || '';

    return { answers, correctAnswerId };
  }

  // Caso por defecto: generar respuestas vacías
  console.warn(`Estructura de opciones desconocida para la pregunta ${questionIndex}:`, options);
  const defaultAnswers: Answer[] = [
    { id: `q${questionIndex}-a0`, text: 'Opción A', isCorrect: true },
    { id: `q${questionIndex}-a1`, text: 'Opción B', isCorrect: false },
    { id: `q${questionIndex}-a2`, text: 'Opción C', isCorrect: false },
    { id: `q${questionIndex}-a3`, text: 'Opción D', isCorrect: false },
  ];

  return { answers: defaultAnswers, correctAnswerId: `q${questionIndex}-a0` };
}

/**
 * Transforma una pregunta de Django al formato interno del quiz
 */
function transformQuestion(djangoQuestion: DjangoQuestion, index: number): Question {
  const { answers, correctAnswerId } = parseOptions(
    djangoQuestion.options,
    index
  );

  return {
    id: `question-${index}`,
    question: djangoQuestion.question,
    answers,
    difficulty: mapDifficulty(djangoQuestion.difficulty),
    correctAnswerId,
  };
}

/**
 * Transforma un array de preguntas de Django en un GeneratedQuiz
 */
export function transformDjangoQuestions(
  questions: DjangoQuestion[],
  exam: DjangoExam,
  document: DjangoDocument
): GeneratedQuiz {
  const transformedQuestions: Question[] = questions.map((q, index) => transformQuestion(q, index));

  const quizName = `${document.name} - Páginas ${exam.page_start}-${exam.page_end}`;

  // Calcular la distribución de dificultades
  const easyCount = transformedQuestions.filter(q => q.difficulty === 'easy').length;
  const mediumCount = transformedQuestions.filter(q => q.difficulty === 'medium').length;
  const hardCount = transformedQuestions.filter(q => q.difficulty === 'hard').length;

  return {
    id: nanoid(),
    pdfName: quizName,
    questions: transformedQuestions,
    createdAt: new Date().toISOString(),
    config: {
      totalQuestions: transformedQuestions.length,
      easyCount,
      mediumCount,
      hardCount,
    },
  };
}

/**
 * @deprecated Usar transformDjangoQuestions en su lugar
 * Alias para compatibilidad con código legacy
 */
export const transformExternalQuestions = transformDjangoQuestions;
