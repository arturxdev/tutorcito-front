'use client';

import { useState } from 'react';
import { Loader2, Plus, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QuestionConfig } from '@/components/shared/QuestionConfig';
import { CustomPromptInput } from '@/components/shared/CustomPromptInput';
import { toast } from 'sonner';

interface AddQuestionsDialogProps {
  bankId: string;
  bankName: string;
  currentTotalQuestions: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddQuestionsDialog({
  bankId,
  bankName,
  currentTotalQuestions,
  open,
  onOpenChange,
  onSuccess,
}: AddQuestionsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [config, setConfig] = useState({
    totalQuestions: 10,
    easyCount: 4,
    mediumCount: 3,
    hardCount: 3,
  });

  const maxQuestionsAllowed = 100 - currentTotalQuestions;
  const newTotal = currentTotalQuestions + config.totalQuestions;
  const canAddQuestions = newTotal <= 100;

  const handleAdd = async () => {
    if (!canAddQuestions) {
      toast.error(`No puedes superar el límite de 100 preguntas por banco`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/question-banks/${bankId}/add-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al agregar preguntas');
      }

      toast.success(
        `${config.totalQuestions} pregunta${config.totalQuestions !== 1 ? 's' : ''} agregada${config.totalQuestions !== 1 ? 's' : ''} exitosamente`
      );
      onSuccess();
      onOpenChange(false);
      setCustomPrompt('');
      // Reset config
      setConfig({
        totalQuestions: 10,
        easyCount: 4,
        mediumCount: 3,
        hardCount: 3,
      });
    } catch (error) {
      console.error('Error adding questions:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar preguntas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus size={24} className="text-purple-600 dark:text-purple-400" />
            Agregar Más Preguntas
          </DialogTitle>
          <DialogDescription>
            Generar preguntas adicionales para el banco "{bankName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current State Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              📊 Actualmente tienes <strong>{currentTotalQuestions}</strong> preguntas. 
              Puedes agregar hasta <strong>{maxQuestionsAllowed}</strong> más.
            </p>
          </div>

          {/* Question Configuration */}
          <div>
            <QuestionConfig
              onChange={setConfig}
              disabled={isLoading}
              maxQuestions={maxQuestionsAllowed}
            />
          </div>

          {/* New Total Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Total después de agregar:
              </span>
              <span className={`text-lg font-bold ${
                newTotal > 100 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {newTotal} / 100
              </span>
            </div>
            {newTotal > 100 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                ⚠️ Excede el límite máximo de 100 preguntas
              </p>
            )}
          </div>

          {/* Custom Prompt */}
          <div>
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
                <p className="font-semibold">💡 Ten en cuenta:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Las preguntas se generarán desde el mismo PDF del banco</li>
                  <li>El proceso puede tomar varios minutos</li>
                  <li>Las nuevas preguntas se agregarán al final del banco</li>
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
            onClick={handleAdd}
            disabled={isLoading || !canAddQuestions}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Agregar {config.totalQuestions} Pregunta{config.totalQuestions !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
