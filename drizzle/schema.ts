import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// QUESTION_BANKS TABLE (antes "folders")
export const questionBanks = pgTable('question_banks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  pdfName: text('pdf_name').notNull(),
  pdfUrl: text('pdf_url'), // URL de Supabase Storage
  description: text('description'),
  customPrompt: text('custom_prompt'), // Instrucciones personalizadas del usuario
  totalQuestions: integer('total_questions').notNull().default(0),
  easyCount: integer('easy_count').notNull().default(0),
  mediumCount: integer('medium_count').notNull().default(0),
  hardCount: integer('hard_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// QUESTIONS TABLE
export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  bankId: uuid('bank_id').notNull().references(() => questionBanks.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  difficulty: text('difficulty').notNull(), // 'easy' | 'medium' | 'hard'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ANSWERS TABLE
export const answers = pgTable('answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCorrect: boolean('is_correct').notNull().default(false),
  displayOrder: integer('display_order').notNull().default(0),
});

// RELATIONS
export const questionBanksRelations = relations(questionBanks, ({ many }) => ({
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  bank: one(questionBanks, {
    fields: [questions.bankId],
    references: [questionBanks.id],
  }),
  answers: many(answers),
}));

export const answersRelations = relations(answers, ({ one }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));
