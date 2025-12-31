import { Suspense } from 'react';
import { CreateBankForm } from '@/components/question-banks/CreateBankForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewQuestionBankPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft size={16} />
            Volver al Dashboard
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Crear Banco de Preguntas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sube un PDF y genera automáticamente preguntas de opción múltiple con IA
        </p>
      </div>
      
      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>📚 Importante:</strong> Puedes generar hasta 100 preguntas por banco. 
          El proceso puede tomar varios minutos dependiendo del tamaño del PDF y la cantidad de preguntas.
        </p>
      </div>
      
      {/* Form */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }>
        <CreateBankForm />
      </Suspense>
    </div>
  );
}
