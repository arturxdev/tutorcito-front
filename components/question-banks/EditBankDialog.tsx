'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface EditBankDialogProps {
  bank: {
    id: string;
    name: string;
    description: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditBankDialog({
  bank,
  open,
  onOpenChange,
  onSuccess,
}: EditBankDialogProps) {
  const [name, setName] = useState(bank.name);
  const [description, setDescription] = useState(bank.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      return;
    }

    if (name.length > 100) {
      setNameError('El nombre no puede exceder 100 caracteres');
      return;
    }

    setNameError('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/question-banks/${bank.id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el banco');
      }

      toast.success('Banco actualizado exitosamente');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating bank:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar el banco');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Banco de Preguntas</DialogTitle>
            <DialogDescription>
              Actualiza el nombre y descripción del banco
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Biología - Sistema Cardiovascular"
                disabled={isLoading}
                maxLength={100}
                aria-invalid={!!nameError}
              />
              {nameError && (
                <p className="text-sm text-red-600 dark:text-red-400">{nameError}</p>
              )}
              <p className="text-xs text-gray-500">
                {name.length}/100 caracteres
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-gray-500">(opcional)</span>
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Breve descripción del contenido..."
                disabled={isLoading}
                maxLength={500}
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 resize-none
                         focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">
                {description.length}/500 caracteres
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
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
