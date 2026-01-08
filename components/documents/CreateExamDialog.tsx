'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { createExam } from '@/lib/api/django-api';
import { toast } from 'sonner';
import type { DjangoDocument } from '@/types/django-api';
import { Button3D } from '../ui/button-3d';

interface CreateExamDialogProps {
  document: DjangoDocument;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateExamDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: CreateExamDialogProps) {
  const [pageStart, setPageStart] = useState('1');
  const [pageEnd, setPageEnd] = useState(document.num_pages.toString());
  const [numQuestions, setNumQuestions] = useState('10');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const start = parseInt(pageStart);
    const end = parseInt(pageEnd);
    const questions = parseInt(numQuestions);

    if (isNaN(start) || start < 1) {
      newErrors.pageStart = 'Página inicial debe ser mayor a 0';
    }
    if (isNaN(end) || end > document.num_pages) {
      newErrors.pageEnd = `Página final no puede exceder ${document.num_pages}`;
    }
    if (start > end) {
      newErrors.pageEnd = 'Página final debe ser mayor a la inicial';
    }
    if (isNaN(questions) || questions < 1 || questions > 100) {
      newErrors.numQuestions = 'Debe estar entre 1 y 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const newExam = await createExam({
        document: document.id,
        page_start: parseInt(pageStart),
        page_end: parseInt(pageEnd),
        num_questions: parseInt(numQuestions),
      });

      console.log('✅ Examen creado:', newExam);

      toast.success('Examen creado exitosamente', {
        description: newExam.status === 'process'
          ? 'Se están generando las preguntas. Esto puede tomar varios minutos...'
          : 'El examen está listo para usar',
      });

      // Reset form
      setPageStart('1');
      setPageEnd(document.num_pages.toString());
      setNumQuestions('10');
      setErrors({});

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear examen';
      toast.error(message);
      console.error('❌ Error al crear examen:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

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
                Generar Nuevo Examen
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pageStart">Página Inicial</Label>
                  <Input
                    id="pageStart"
                    type="number"
                    min="1"
                    max={document.num_pages}
                    value={pageStart}
                    onChange={(e) => setPageStart(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.pageStart && (
                    <p className="text-sm text-red-600 mt-1">{errors.pageStart}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pageEnd">Página Final</Label>
                  <Input
                    id="pageEnd"
                    type="number"
                    min="1"
                    max={document.num_pages}
                    value={pageEnd}
                    onChange={(e) => setPageEnd(e.target.value)}
                    disabled={isLoading}
                  />
                  {errors.pageEnd && (
                    <p className="text-sm text-red-600 mt-1">{errors.pageEnd}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="numQuestions">Número de Preguntas</Label>
                <Input
                  id="numQuestions"
                  type="number"
                  min="1"
                  max="100"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  disabled={isLoading}
                />
                {errors.numQuestions && (
                  <p className="text-sm text-red-600 mt-1">{errors.numQuestions}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Recomendado: 5-20 preguntas
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>💡 Nota:</strong> La generación puede tomar varios minutos.
                  Recibirás una notificación cuando esté listo.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button3D
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button3D>
                <Button3D
                  type="submit"
                  size="sm"
                  variant="green"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generar Examen
                    </>
                  )}
                </Button3D>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
