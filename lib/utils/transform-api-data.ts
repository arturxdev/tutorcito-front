import { nanoid } from 'nanoid';
import {
  ExternalQuestion,
  ExternalDifficulty,
  ExternalExam,
  ExternalDocument,
} from '@/types/external-api';
import {
  Question,
  Answer,
  Difficulty,
  GeneratedQuiz,
} from '@/types/quiz';

/**
 * Mapea la dificultad de la API externa al formato interno
 */
function mapDifficulty(externalDiff: ExternalDifficulty): Difficulty {
  const difficultyMap: Record<ExternalDifficulty, Difficulty> = {
    'facil': 'easy',
    'medio': 'medium',
    'dificil': 'hard',
  };
  
  return difficultyMap[externalDiff] || 'medium';
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
 * Transforma una pregunta de la API externa al formato interno
 */
function transformQuestion(externalQuestion: ExternalQuestion): Question {
  const { answers, correctAnswerId } = parseOptions(
    externalQuestion.options,
    externalQuestion.id
  );
  
  return {
    id: String(externalQuestion.id),
    question: externalQuestion.question,
    answers,
    difficulty: mapDifficulty(externalQuestion.difficulty),
    correctAnswerId,
  };
}

/**
 * Transforma un array de preguntas externas en un GeneratedQuiz
 */
export function transformExternalQuestions(
  externalQuestions: ExternalQuestion[],
  exam: ExternalExam,
  document: ExternalDocument
): GeneratedQuiz {
  const questions: Question[] = externalQuestions.map(transformQuestion);
  
  const quizName = `${document.name} - Páginas ${exam.page_start}-${exam.page_end}`;
  
  // Calcular la distribución de dificultades
  const easyCount = questions.filter(q => q.difficulty === 'easy').length;
  const mediumCount = questions.filter(q => q.difficulty === 'medium').length;
  const hardCount = questions.filter(q => q.difficulty === 'hard').length;
  
  return {
    id: nanoid(),
    pdfName: quizName,
    questions,
    createdAt: new Date().toISOString(),
    config: {
      totalQuestions: questions.length,
      easyCount,
      mediumCount,
      hardCount,
    },
  };
}
