'use client';

import { useCallback, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { playSound, SOUNDS } from '@/utils/sounds';

interface PDFUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function PDFUploader({ onFileSelect, disabled }: PDFUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        onFileSelect(droppedFile);
        playSound(SOUNDS.CLICK);
      }
    },
    [onFileSelect, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        onFileSelect(selectedFile);
        playSound(SOUNDS.CLICK);
      }
    },
    [onFileSelect]
  );

  const clearFile = useCallback(() => {
    setFile(null);
    playSound(SOUNDS.CLICK);
  }, []);

  return (
    <div className="w-full">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-8
          transition-all duration-300
          ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : 'border-gray-300 dark:border-gray-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400'}
          ${file ? 'bg-green-50 dark:bg-green-950/20 border-green-500' : ''}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          id="pdf-upload"
        />

        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <FileText size={48} className="text-green-600 dark:text-green-400" />
                </motion.div>
                <div>
                  <p className="font-semibold text-lg text-green-700 dark:text-green-300">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearFile();
                }}
                disabled={disabled}
              >
                <X size={24} />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="no-file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Upload
                  size={64}
                  className={`mb-4 ${
                    isDragging
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                />
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
                {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra tu PDF aquí'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                o haz clic para seleccionar un archivo
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Tamaño máximo: 10MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
