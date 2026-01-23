'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useQuizStore } from '@/store/quizStore';
import { transformDjangoQuestions } from '@/lib/utils/transform-api-data';
import type { DjangoDocument } from '@/types/django-api';
import { Button3D } from '../ui/button-3d';

interface CreateExamDialogProps {
  documents: DjangoDocument[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export function CreateExamDialog({ documents, open, onOpenChange }: CreateExamDialogProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const { setQuiz } = useQuizStore();

  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [pageStart, setPageStart] = useState('1');
  const [pageEnd, setPageEnd] = useState('10');
  const [numQuestions, setNumQuestions] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update pageEnd when document changes
  useEffect(() => {
    if (selectedDocumentId) {
      const doc = documents.find(d => d.id === selectedDocumentId);
      if (doc) {
        setPageEnd(Math.min(parseInt(pageStart) + 9, doc.num_pages).toString());
      }
    }
  }, [selectedDocumentId, pageStart, documents]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const doc = documents.find(d => d.id === selectedDocumentId);

    if (!selectedDocumentId || !doc) {
      newErrors.document = 'Debes seleccionar un documento';
    }

    const start = parseInt(pageStart);
    const end = parseInt(pageEnd);
    const questions = parseInt(numQuestions);

    if (isNaN(start) || start < 1) {
      newErrors.pageStart = 'Página inicial debe ser mayor a 0';
    }

    if (doc) {
      if (isNaN(end) || end > doc.num_pages) {
        newErrors.pageEnd = `Página final no puede exceder ${doc.num_pages}`;
      }

      if (start > end) {
        newErrors.pageEnd = 'Página final debe ser mayor a la inicial';
      }

      if (end - start + 1 > 10) {
        newErrors.pageEnd = 'El rango no puede exceder 10 páginas';
      }
    }

    if (isNaN(questions) || questions < 1 || questions > 20) {
      newErrors.numQuestions = 'Debe estar entre 1 y 20 preguntas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    toast.loading('Generando examen...', { id: 'exam' });

    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/exams/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          document: selectedDocumentId!,
          page_start: parseInt(pageStart),
          page_end: parseInt(pageEnd),
          num_questions: parseInt(numQuestions),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.detail || 'Error al crear examen');
      }

      const examData = await response.json();
      const questions = examData.questions || [];

      if (!questions || questions.length === 0) {
        throw new Error('No se generaron preguntas para este examen');
      }

      const document = documents.find(d => d.id === selectedDocumentId)!;
      const djangoQuestions = questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      }));

      const quiz = transformDjangoQuestions(djangoQuestions, examData, document);
      setQuiz(quiz);

      toast.success('¡Examen listo!', {
        id: 'exam',
        description: `${questions.length} preguntas generadas`,
      });

      onOpenChange(false);
      setTimeout(() => router.push('/quiz'), 300);

    } catch (err) {
      toast.error('Error al crear examen', {
        id: 'exam',
        description: err instanceof Error ? err.message : 'Error desconocido',
      });
      console.error('Error creating exam:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setSelectedDocumentId(null);
      setPageStart('1');
      setPageEnd('10');
      setNumQuestions('10');
      setErrors({});
    }
  };

  if (!open) return null;

  const selectedDoc = documents.find(d => d.id === selectedDocumentId);

  return (
    <AnimatePresence>
      {/* Backdrop with backdrop blur */}
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        {/* Modal Card - Responsive width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br bg-docker-500 flex items-center justify-center">
                  <FileQuestion className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Crear Examen
                </h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Document Selector - Mobile optimized */}
              <div>
                <Label htmlFor="document" className="text-sm font-semibold">
                  Selecciona tu archivo
                </Label>
                <select
                  id="document"
                  value={selectedDocumentId || ''}
                  onChange={(e) => setSelectedDocumentId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isLoading}
                  className="w-full mt-1 h-11 px-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-[#2460FF] focus:ring-2 focus:ring-[#2460FF]/20 transition-all disabled:opacity-50"
                >
                  <option value="">-- Selecciona un documento --</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.num_pages} {doc.num_pages === 1 ? 'página' : 'páginas'})
                    </option>
                  ))}
                </select>
                {errors.document && (
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">{errors.document}</p>
                )}
              </div>

              {/* Page Range - Stack vertical on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <Label htmlFor="pageStart" className="text-sm font-semibold">
                    Desde página
                  </Label>
                  <Input
                    id="pageStart"
                    type="number"
                    min="1"
                    max={selectedDoc?.num_pages || 1}
                    value={pageStart}
                    onChange={(e) => setPageStart(e.target.value)}
                    disabled={isLoading || !selectedDocumentId}
                    placeholder="Ej: 1"
                    className="h-11 text-base mt-1"
                  />
                  {errors.pageStart && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">{errors.pageStart}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pageEnd" className="text-sm font-semibold">
                    Hasta página
                  </Label>
                  <Input
                    id="pageEnd"
                    type="number"
                    min={parseInt(pageStart) || 1}
                    max={selectedDoc?.num_pages || 1}
                    value={pageEnd}
                    onChange={(e) => setPageEnd(e.target.value)}
                    disabled={isLoading || !selectedDocumentId}
                    placeholder="Ej: 10"
                    className="h-11 text-base mt-1"
                  />
                  {errors.pageEnd && (
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">{errors.pageEnd}</p>
                  )}
                </div>
              </div>

              {selectedDoc && (
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span>💡</span>
                  <span>Máximo 10 páginas por examen</span>
                </p>
              )}

              {/* Number of Questions */}
              <div>
                <Label htmlFor="numQuestions" className="text-sm font-semibold">
                  Número de preguntas
                </Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ej: 10"
                  className="h-11 text-base mt-1"
                />
                {errors.numQuestions && (
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">{errors.numQuestions}</p>
                )}
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recomendado: 5-15 preguntas
                </p>
              </div>

              {/* Info Alert - More compact on mobile */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-900 dark:text-blue-300 leading-relaxed">
                  <strong className="font-semibold">💡 Nota:</strong> La generación puede tomar algunos momentos. No cierres esta ventana.
                </p>
              </div>

              {/* Actions - Stack vertical on mobile, primary button first */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Button3D
                  type="button"
                  variant="white"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="w-full sm:flex-1 min-h-[48px] order-2 sm:order-1"
                >
                  Cancelar
                </Button3D>
                <Button3D
                  type="submit"
                  variant="green"
                  disabled={isLoading || !selectedDocumentId}
                  className="w-full sm:flex-1 min-h-[48px] order-1 sm:order-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <FileQuestion className="w-4 h-4 mr-2" />
                      <span>Crear Examen</span>
                    </>
                  )}
                </Button3D>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
