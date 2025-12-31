import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../drizzle/schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Connection string desde Supabase
const connectionString = process.env.DATABASE_URL;

// Cliente de postgres
// Disable prepared statements para compatibilidad con Supabase
const client = postgres(connectionString, { prepare: false });

// Cliente de Drizzle con schema
export const db = drizzle(client, { schema });

// Re-export types
export type QuestionBank = typeof schema.questionBanks.$inferSelect;
export type NewQuestionBank = typeof schema.questionBanks.$inferInsert;
export type Question = typeof schema.questions.$inferSelect;
export type NewQuestion = typeof schema.questions.$inferInsert;
export type Answer = typeof schema.answers.$inferSelect;
export type NewAnswer = typeof schema.answers.$inferInsert;
