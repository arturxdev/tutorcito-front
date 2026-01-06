'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, FileQuestion } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useQuizStore } from '@/store/quizStore';
import { transformDjangoQuestions } from '@/lib/utils/transform-api-data';
import type { DjangoDocument } from '@/types/django-api';

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
      // 1. Create exam (response should include questions)
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
      console.log('📦 Exam data received:', examData);

      // 2. Extract questions from the response
      const questions = examData.questions || [];

      if (!questions || questions.length === 0) {
        throw new Error('No se generaron preguntas para este examen');
      }

      console.log(`✅ ${questions.length} preguntas recibidas`);

      // 3. Get document
      const document = documents.find(d => d.id === selectedDocumentId)!;

      // 4. Transform questions to DjangoQuestion format for transform function
      const djangoQuestions = questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      }));

      // 5. Transform and load into store
      const quiz = transformDjangoQuestions(djangoQuestions, examData, document);
      console.log('🎯 Quiz transformed:', quiz);
      setQuiz(quiz);

      // 6. Success and navigate
      toast.success('¡Examen listo!', {
        id: 'exam',
        description: `${questions.length} preguntas generadas`,
      });

      onOpenChange(false);

      setTimeout(() => {
        router.push('/quiz');
      }, 300);

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
      // Reset form
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg"
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Crear Examen
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Document Selector */}
              <div>
                <Label htmlFor="document">Selecciona tu archivo</Label>
                <select
                  id="document"
                  value={selectedDocumentId || ''}
                  onChange={(e) => setSelectedDocumentId(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={isLoading}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">-- Selecciona un documento --</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} ({doc.num_pages} páginas)
                    </option>
                  ))}
                </select>
                {errors.document && (
                  <p className="text-sm text-red-600 mt-1">{errors.document}</p>
                )}
              </div>

              {/* Page Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageStart">Desde</Label>
                  <Input
                    id="pageStart"
                    type="number"
                    min="1"
                    max={selectedDoc?.num_pages || 1}
                    value={pageStart}
                    onChange={(e) => setPageStart(e.target.value)}
                    disabled={isLoading || !selectedDocumentId}
                    placeholder="Página inicial"
                  />
                  {errors.pageStart && (
                    <p className="text-sm text-red-600 mt-1">{errors.pageStart}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pageEnd">Hasta</Label>
                  <Input
                    id="pageEnd"
                    type="number"
                    min={parseInt(pageStart) || 1}
                    max={selectedDoc?.num_pages || 1}
                    value={pageEnd}
                    onChange={(e) => setPageEnd(e.target.value)}
                    disabled={isLoading || !selectedDocumentId}
                    placeholder="Página final"
                  />
                  {errors.pageEnd && (
                    <p className="text-sm text-red-600 mt-1">{errors.pageEnd}</p>
                  )}
                </div>
              </div>

              {selectedDoc && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Máximo 10 páginas por examen
                </p>
              )}

              {/* Number of Questions */}
              <div>
                <Label htmlFor="numQuestions">Número de preguntas</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  disabled={isLoading}
                  placeholder="Número de preguntas"
                />
                {errors.numQuestions && (
                  <p className="text-sm text-red-600 mt-1">{errors.numQuestions}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Entre 1 y 20 preguntas
                </p>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>💡 Nota:</strong> La generación puede tomar algunos momentos.
                  No cierres esta ventana.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedDocumentId}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileQuestion className="w-4 h-4 mr-2" />
                      Crear
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
