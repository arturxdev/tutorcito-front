/**
 * Mappers para convertir entre tipos de Django y tipos de QuestionBank del frontend
 */

import type { DjangoDocument, DjangoExam, DjangoQuestion } from '@/types/django-api';
import type { QuestionBank, QuestionBankWithQuestions, Question, Answer } from '@/types/question-bank';
import { countByDifficulty, toFrontendDifficulty } from '@/lib/utils/difficulty-mapper';

/**
 * Mapea un Document de Django + Exam + Questions a QuestionBank
 */
export function mapToQuestionBank(
  document: DjangoDocument,
  exam: DjangoExam | null,
  questions: DjangoQuestion[]
): QuestionBank {
  const counts = countByDifficulty(questions);

  return {
    id: String(document.id),
    name: document.name,
    pdfName: document.name,
    pdfUrl: document.url,
    totalQuestions: counts.total,
    easyCount: counts.easy,
    mediumCount: counts.medium,
    hardCount: counts.hard,
    createdAt: document.created_at,
    _documentId: document.id,
    _examId: exam?.id ?? null,
  };
}

/**
 * Mapea DjangoQuestion a Question del frontend
 */
export function mapToQuestion(djangoQuestion: DjangoQuestion): Question {
  // Django guarda las opciones en un JSONField con estructura flexible
  // Necesitamos extraer las respuestas del campo options
  const answers: Answer[] = [];
  
  // El campo options puede tener diferentes estructuras según cómo Django lo guardó
  // Intentamos manejar los casos más comunes
  if (Array.isArray(djangoQuestion.options)) {
    // Si es un array directo: [{text: "...", isCorrect: true}, ...]
    djangoQuestion.options.forEach((opt: any) => {
      if (opt && typeof opt === 'object' && 'text' in opt && 'isCorrect' in opt) {
        answers.push({
          text: String(opt.text),
          isCorrect: Boolean(opt.isCorrect),
        });
      }
    });
  } else if (typeof djangoQuestion.options === 'object' && djangoQuestion.options !== null) {
    // Si es un objeto: {a: {text: "...", isCorrect: true}, b: {...}, ...}
    // o {options: [{...}]}
    const opts = (djangoQuestion.options as any).options || djangoQuestion.options;
    
    if (Array.isArray(opts)) {
      opts.forEach((opt: any) => {
        if (opt && typeof opt === 'object' && 'text' in opt && 'isCorrect' in opt) {
          answers.push({
            text: String(opt.text),
            isCorrect: Boolean(opt.isCorrect),
          });
        }
      });
    } else {
      // Si es un objeto con keys arbitrarias
      Object.values(opts).forEach((opt: any) => {
        if (opt && typeof opt === 'object' && 'text' in opt && 'isCorrect' in opt) {
          answers.push({
            text: String(opt.text),
            isCorrect: Boolean(opt.isCorrect),
          });
        }
      });
    }
  }

  return {
    id: djangoQuestion.id,
    question: djangoQuestion.question,
    difficulty: toFrontendDifficulty(djangoQuestion.difficulty),
    answers,
  };
}

/**
 * Mapea Document + Exam + Questions a QuestionBankWithQuestions
 */
export function mapToQuestionBankWithQuestions(
  document: DjangoDocument,
  exam: DjangoExam,
  questions: DjangoQuestion[]
): QuestionBankWithQuestions {
  const bank = mapToQuestionBank(document, exam, questions);
  const mappedQuestions = questions.map(mapToQuestion);

  return {
    ...bank,
    questions: mappedQuestions,
  };
}
