import { auth } from '@clerk/nextjs/server';
import { useAuth } from '@clerk/nextjs';

/**
 * Gets the Clerk session token for server-side requests
 */
export async function getClerkToken(): Promise<string | null> {
  const { getToken } = await auth();
  return await getToken();
}

/**
 * Hook to get Clerk token in client components
 */
export function useClerkToken() {
  const { getToken } = useAuth();
  return getToken;
}
