'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { uploadDocument } from '@/lib/api/django-api';
import { formatFileSize } from '@/utils/document-status';
import { toast } from 'sonner';

export function DocumentUploader() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  // Validar archivo
  const validateFile = (file: File): string | null => {
    // Validar tipo
    if (file.type !== 'application/pdf') {
      return 'Solo se permiten archivos PDF';
    }

    // Validar tamaño (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'El archivo no puede superar 50MB';
    }

    return null;
  };

  // Manejar selección de archivo
  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    setError('');
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // File input handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Remove selected file
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError('');
  }, []);

  // Upload file
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');

    try {
      await uploadDocument(selectedFile);
      
      toast.success('Documento subido exitosamente', {
        description: 'Procesando el PDF en segundo plano...',
      });

      // Redirect to list
      router.push('/documentos');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al subir el documento';
      setError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      {!selectedFile && (
        <Card
          className={`relative border-2 border-dashed transition-all duration-300 ${
            isDragging
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : error
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-12">
            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                className="mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                  <Upload className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                </div>
              </motion.div>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Arrastra tu PDF aquí
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                o haz click para seleccionar un archivo
              </p>

              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
                id="file-input"
                disabled={isUploading}
              />
              <label htmlFor="file-input">
                <Button variant="outline" size="lg" asChild>
                  <span className="cursor-pointer">
                    Seleccionar PDF
                  </span>
                </Button>
              </label>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Tamaño máximo: 50MB • Solo archivos PDF
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* File Preview */}
      {selectedFile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                  {selectedFile.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              {!isUploading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemoveFile}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              {isUploading && (
                <div className="flex-shrink-0">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            {!isUploading && (
              <div className="mt-6">
                <Button
                  onClick={handleUpload}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Subir Documento
                </Button>
              </div>
            )}

            {/* Uploading State */}
            {isUploading && (
              <div className="mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                        Subiendo documento...
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Por favor espera un momento
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <p className="text-sm text-red-800 dark:text-red-300">
            {error}
          </p>
        </motion.div>
      )}

      {/* Info Banner */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          <strong>💡 Nota:</strong> Una vez subido, el PDF será procesado en segundo plano
          para extraer el texto. Podrás generar exámenes cuando el procesamiento termine.
        </p>
      </Card>
    </div>
  );
}
