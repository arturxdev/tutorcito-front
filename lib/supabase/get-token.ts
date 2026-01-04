import { createClient } from './client';

/**
 * Obtiene el access token de Supabase para el usuario autenticado
 * @returns El access token o null si no hay sesión activa
 */
export async function getSupabaseToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
