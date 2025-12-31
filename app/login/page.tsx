'use client';

import { Suspense } from 'react';
import { Logo } from '@/components/layout/Logo';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      const errorMessages: Record<string, string> = {
        'auth_callback_error': 'Error en la autenticación. Por favor intenta de nuevo.',
        'no_code': 'No se recibió código de autenticación.',
        'unexpected_error': 'Error inesperado. Por favor intenta de nuevo.',
      };
      
      const message = errorMessages[error] || `Error: ${error}`;
      toast.error(message);
    }
  }, [error]);

  return (
    <>
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-300 text-center">
            Hubo un problema con el inicio de sesión. Por favor intenta de nuevo.
          </p>
        </div>
      )}

      <GoogleLoginButton />
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Accede a tus bancos de preguntas
          </p>

          <Suspense fallback={<GoogleLoginButton />}>
            <LoginForm />
          </Suspense>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
