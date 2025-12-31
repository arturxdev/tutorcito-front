'use client';

import { useState } from 'react';
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CustomPromptInput } from '@/components/shared/CustomPromptInput';
import { toast } from 'sonner';

interface RegenerateQuestionsDialogProps {
  bankId: string;
  bankName: string;
  selectedQuestionIds: string[];
  selectedQuestions: Array<{
    id: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RegenerateQuestionsDialog({
  bankId,
  bankName,
  selectedQuestionIds,
  selectedQuestions,
  open,
  onOpenChange,
  onSuccess,
}: RegenerateQuestionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [maintainDifficulties, setMaintainDifficulties] = useState(true);

  // Calculate difficulty distribution
  const easyCount = selectedQuestions.filter(q => q.difficulty === 'easy').length;
  const mediumCount = selectedQuestions.filter(q => q.difficulty === 'medium').length;
  const hardCount = selectedQuestions.filter(q => q.difficulty === 'hard').length;

  const handleRegenerate = async () => {
    if (selectedQuestionIds.length === 0) {
      toast.error('No hay preguntas seleccionadas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/question-banks/${bankId}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionIds: selectedQuestionIds,
          maintainDifficulties,
          customPrompt: customPrompt.trim() || undefined,
          // Send difficulty distribution if maintaining
          ...(maintainDifficulties && {
            easyCount,
            mediumCount,
            hardCount,
          }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al regenerar las preguntas');
      }

      toast.success(
        `${selectedQuestionIds.length} pregunta${selectedQuestionIds.length !== 1 ? 's' : ''} regenerada${selectedQuestionIds.length !== 1 ? 's' : ''} exitosamente`
      );
      onSuccess();
      onOpenChange(false);
      setCustomPrompt('');
    } catch (error) {
      console.error('Error regenerating questions:', error);
      toast.error(error instanceof Error ? error.message : 'Error al regenerar las preguntas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw size={24} className="text-purple-600 dark:text-purple-400" />
            Regenerar Preguntas
          </DialogTitle>
          <DialogDescription>
            Regenerar preguntas seleccionadas desde el PDF original
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              📄 Se regenerarán <strong>{selectedQuestionIds.length}</strong> pregunta{selectedQuestionIds.length !== 1 ? 's' : ''} desde el PDF del banco "{bankName}"
            </p>
          </div>

          {/* Current Distribution */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              Distribución Actual
            </Label>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 px-4 py-2">
                🟢 Fácil: {easyCount}
              </Badge>
              <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 px-4 py-2">
                🟡 Media: {mediumCount}
              </Badge>
              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 px-4 py-2">
                🔴 Difícil: {hardCount}
              </Badge>
            </div>
          </div>

          {/* Maintain Difficulties Option */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="maintainDifficulties"
                checked={maintainDifficulties}
                onChange={(e) => setMaintainDifficulties(e.target.checked)}
                disabled={isLoading}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <Label htmlFor="maintainDifficulties" className="cursor-pointer font-medium">
                  Mantener distribución de dificultad
                </Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {maintainDifficulties 
                    ? 'Las nuevas preguntas tendrán la misma distribución de dificultad'
                    : 'La IA decidirá la dificultad de las nuevas preguntas automáticamente'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <CustomPromptInput
              value={customPrompt}
              onChange={setCustomPrompt}
              disabled={isLoading}
            />
          </div>

          {/* Warning */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-300 space-y-1">
                <p className="font-semibold">⚠️ Ten en cuenta:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Las preguntas originales serán eliminadas permanentemente</li>
                  <li>El proceso puede tomar varios minutos con muchas preguntas</li>
                  <li>Las nuevas preguntas serán diferentes a las originales</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setCustomPrompt('');
            }}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleRegenerate}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Regenerando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerar Preguntas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
