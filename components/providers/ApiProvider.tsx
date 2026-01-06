'use client';

import { useAuth } from '@clerk/nextjs';
import { setTokenGetter } from '@/lib/api/django-api';
import { useEffect } from 'react';

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    // Configurar la función para obtener tokens
    setTokenGetter(async () => {
      return await getToken();
    });
  }, [getToken]);

  return <>{children}</>;
}
