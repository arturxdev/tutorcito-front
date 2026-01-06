import { DocumentUploader } from '@/components/documents/DocumentUploader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewDocumentPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/documentos">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft size={16} />
            Volver a Documentos
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Subir Documento
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sube un PDF para generar exámenes personalizados
        </p>
      </div>
      
      {/* Info Banner */}
      <div className="mb-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>📚 Importante:</strong> El documento será procesado en segundo plano. 
          Una vez completado, podrás generar exámenes seleccionando rangos de páginas específicos.
        </p>
      </div>
      
      {/* Uploader */}
      <DocumentUploader />
    </div>
  );
}
