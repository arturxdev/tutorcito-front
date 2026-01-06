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
 */
function mapDifficulty(djangoDiff: QuestionDifficulty): Difficulty {
  const difficultyMap: Record<QuestionDifficulty, Difficulty> = {
    'facil': 'easy',
    'medio': 'medium',
    'dificil': 'hard',
  };
  
  return difficultyMap[djangoDiff] || 'medium';
}

/**
 * Convierte las opciones de la API externa al formato interno de Answer[]
 * 
 * La estructura esperada de options puede variar:
 * - Si es un objeto con claves y un campo 'correct_answer'
 * - Si es un array de objetos con { id, text, is_correct }
 * 
 * Esta función intentará manejar ambos casos
 */
function parseOptions(options: any, questionId: number): { answers: Answer[], correctAnswerId: string } {
  // Caso 1: Array de opciones con is_correct
  if (Array.isArray(options)) {
    const answers: Answer[] = options.map((opt, index) => ({
      id: opt.id || `answer-${index}`,
      text: opt.text || opt.answer || String(opt),
      isCorrect: opt.is_correct || opt.isCorrect || false,
    }));
    
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
    
    optionKeys.forEach((key) => {
      answers.push({
        id: key,
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
            id: key,
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
  console.warn(`Estructura de opciones desconocida para la pregunta ${questionId}:`, options);
  const defaultAnswers: Answer[] = [
    { id: 'a', text: 'Opción A', isCorrect: true },
    { id: 'b', text: 'Opción B', isCorrect: false },
    { id: 'c', text: 'Opción C', isCorrect: false },
    { id: 'd', text: 'Opción D', isCorrect: false },
  ];
  
  return { answers: defaultAnswers, correctAnswerId: 'a' };
}

/**
 * Transforma una pregunta de Django al formato interno del quiz
 */
function transformQuestion(djangoQuestion: DjangoQuestion): Question {
  const { answers, correctAnswerId } = parseOptions(
    djangoQuestion.options,
    djangoQuestion.id
  );
  
  return {
    id: String(djangoQuestion.id),
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
  const transformedQuestions: Question[] = questions.map(transformQuestion);
  
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
