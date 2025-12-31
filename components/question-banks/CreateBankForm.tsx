'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PDFUploader } from '@/components/shared/PDFUploader';
import { QuestionConfig } from '@/components/shared/QuestionConfig';
import { CustomPromptInput } from '@/components/shared/CustomPromptInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateCustomPrompt } from '@/lib/utils/prompt-validator';
import { playSound, SOUNDS } from '@/utils/sounds';

interface QuestionBankConfig {
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export function CreateBankForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [config, setConfig] = useState<QuestionBankConfig>({
    totalQuestions: 30,
    easyCount: 10,
    mediumCount: 10,
    hardCount: 10,
  });
  const [customPrompt, setCustomPrompt] = useState('');
  
  // Validation errors
  const [nameError, setNameError] = useState('');
  const [promptError, setPromptError] = useState('');
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      isValid = false;
    } else if (name.length > 100) {
      setNameError('El nombre no puede exceder 100 caracteres');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate PDF
    if (!pdfFile) {
      toast.error('Por favor selecciona un archivo PDF');
      isValid = false;
    } else if (pdfFile.size > 10 * 1024 * 1024) {
      toast.error('El PDF no puede superar 10MB');
      isValid = false;
    }
    
    // Warning para PDFs grandes con muchas preguntas
    if (pdfFile) {
      const pdfSizeMB = pdfFile.size / (1024 * 1024);
      
      // Heurística: ~50 preguntas por MB
      const recommendedMax = Math.max(30, Math.floor(pdfSizeMB * 50));
      
      if (config.totalQuestions > 80 && pdfSizeMB > 2) {
        toast.warning(
          `PDF grande (${pdfSizeMB.toFixed(1)}MB): se recomienda máximo ` +
          `${recommendedMax} preguntas para evitar errores.`,
          { duration: 5000 }
        );
        // No bloquear, solo advertir
      }
    }
    
    // Validate custom prompt
    if (customPrompt.trim()) {
      const validation = validateCustomPrompt(customPrompt);
      if (!validation.isValid) {
        setPromptError(validation.errors[0] || 'Prompt inválido');
        isValid = false;
      } else {
        setPromptError('');
      }
    } else {
      setPromptError('');
    }
    
    // Validate question distribution
    const total = config.easyCount + config.mediumCount + config.hardCount;
    if (total !== config.totalQuestions) {
      toast.error('La suma de preguntas por dificultad debe ser igual al total');
      isValid = false;
    }
    
    if (config.totalQuestions < 3 || config.totalQuestions > 100) {
      toast.error('El número total de preguntas debe estar entre 3 y 100');
      isValid = false;
    }
    
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      playSound(SOUNDS.INCORRECT);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      formData.append('pdf', pdfFile!);
      formData.append('config', JSON.stringify(config));
      if (customPrompt.trim()) {
        formData.append('customPrompt', customPrompt.trim());
      }
      
      // Submit to API
      const response = await fetch('/api/question-banks', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el banco de preguntas');
      }
      
      playSound(SOUNDS.COMPLETE);
      toast.success('¡Banco de preguntas creado exitosamente!');
      
      // Redirect to the bank page
      router.push(`/bancos/${data.bank.id}`);
    } catch (error) {
      console.error('Error creating question bank:', error);
      playSound(SOUNDS.INCORRECT);
      toast.error(error instanceof Error ? error.message : 'Error al crear el banco de preguntas');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Bank Name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <Label htmlFor="name" className="text-lg font-semibold">
          Nombre del Banco de Preguntas *
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
      </motion.div>
      
      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor="description" className="text-lg font-semibold">
          Descripción
          <span className="text-sm font-normal text-gray-500 ml-2">(opcional)</span>
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve descripción del contenido del banco..."
          disabled={isLoading}
          maxLength={500}
          className="w-full min-h-[100px] p-4 rounded-xl border border-gray-300 
                   dark:border-gray-600 bg-white dark:bg-gray-800 resize-y
                   focus:ring-2 focus:ring-purple-500 focus:border-transparent
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-gray-500">
          {description.length}/500 caracteres
        </p>
      </motion.div>
      
      {/* PDF Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        <Label className="text-lg font-semibold">
          Archivo PDF *
        </Label>
        <PDFUploader
          onFileSelect={setPdfFile}
          disabled={isLoading}
        />
      </motion.div>
      
      {/* Question Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <QuestionConfig
          onChange={setConfig}
          disabled={isLoading}
          maxQuestions={100}
        />
      </motion.div>
      
      {/* Custom Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CustomPromptInput
          value={customPrompt}
          onChange={setCustomPrompt}
          disabled={isLoading}
          error={promptError}
        />
      </motion.div>
      
      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-end gap-4"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-[200px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generando preguntas...
            </>
          ) : (
            'Crear Banco de Preguntas'
          )}
        </Button>
      </motion.div>
      
      {/* Loading Message */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-blue-900 dark:text-blue-300">
            ⏳ Generando {config.totalQuestions} preguntas puede tomar varios minutos. 
            Por favor, no cierres esta ventana.
          </p>
        </motion.div>
      )}
    </form>
  );
}
