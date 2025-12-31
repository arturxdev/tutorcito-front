'use client';

import { useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeleteQuestionsDialogProps {
  bankId: string;
  selectedQuestionIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteQuestionsDialog({
  bankId,
  selectedQuestionIds,
  open,
  onOpenChange,
  onSuccess,
}: DeleteQuestionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/question-banks/${bankId}/questions`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIds: selectedQuestionIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar las preguntas');
      }

      toast.success(`${selectedQuestionIds.length} pregunta${selectedQuestionIds.length !== 1 ? 's' : ''} eliminada${selectedQuestionIds.length !== 1 ? 's' : ''} exitosamente`);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting questions:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar las preguntas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
            Eliminar Preguntas
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            ¿Estás seguro de que quieres eliminar <strong>{selectedQuestionIds.length}</strong> pregunta{selectedQuestionIds.length !== 1 ? 's' : ''}?
          </p>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-300">
              ⚠️ Las preguntas y sus respuestas serán eliminadas permanentemente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar Preguntas'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
