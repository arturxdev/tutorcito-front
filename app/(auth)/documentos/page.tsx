'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, BookOpen, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { toast } from 'sonner';
import { getDocuments, getExams } from '@/lib/api/django-api';
import { DocumentWithExams } from '@/types/django-api';
import { getDocumentProcessingStatus } from '@/utils/document-status';

export default function BancosPage() {
  const [documents, setDocuments] = useState<DocumentWithExams[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithExams[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch documents and exams
  const fetchDocuments = async () => {
    try {
      const [documentsData, examsData] = await Promise.all([
        getDocuments(),
        getExams(),
      ]);

      const documentsWithExams: DocumentWithExams[] = documentsData.map((doc) => {
        const docExams = examsData.filter((exam) => exam.document === doc.id);
        return {
          ...doc,
          exams: docExams,
          examCount: docExams.length,
          processingStatus: getDocumentProcessingStatus(doc, docExams),
        };
      });

      setDocuments(documentsWithExams);
      setFilteredDocuments(documentsWithExams);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cargar los documentos');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Refresh documents
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDocuments();
    toast.success('Documentos actualizados');
  };

  // Filter documents by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query)
    );
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mis Documentos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {documents.length === 0
                ? 'Aún no tienes documentos subidos'
                : `${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'} en total`}
            </p>
          </div>
          <div className="flex gap-2">
            {documents.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                Recargar
              </Button>
            )}
            <Link href="/documentos/new">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus size={20} />
                Subir Documento
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {documents.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o archivo PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            No tienes documentos aún
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Sube tu primer documento PDF y genera exámenes personalizados con IA.
          </p>
          <Link href="/documentos/new">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus size={20} />
              Subir Primer Documento
            </Button>
          </Link>
        </motion.div>
      )}

      {/* No Results */}
      {documents.length > 0 && filteredDocuments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            No se encontraron resultados
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Intenta con otros términos de búsqueda
          </p>
        </motion.div>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDocuments.map((doc, idx) => (
              <DocumentCard key={doc.id} document={doc} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            📊 Estadísticas Generales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {documents.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Documentos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {documents.reduce((sum, doc) => sum + doc.examCount, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exámenes Generados</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {documents.filter((doc) => doc.processingStatus === 'ready').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Listos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {documents.filter((doc) => doc.processingStatus === 'processing').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Procesando</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
