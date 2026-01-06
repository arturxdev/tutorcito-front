'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface BankCardProps {
  id: string;
  name: string;
  description: string | null;
  pdfName: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  createdAt: Date;
  onDelete?: (id: string) => void;
}

export function BankCard({
  id,
  name,
  description,
  pdfName,
  totalQuestions,
  easyCount,
  mediumCount,
  hardCount,
  createdAt,
  onDelete,
}: BankCardProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full p-6 border-2 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 hover:shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
              {name}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* PDF Info */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-sm text-blue-900 dark:text-blue-300 truncate">
            {pdfName}
          </span>
        </div>

        {/* Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total de Preguntas
            </span>
            <Badge variant="outline" className="font-bold">
              {totalQuestions}
            </Badge>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50">
              🟢 Fácil: {easyCount}
            </Badge>
            <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50">
              🟡 Media: {mediumCount}
            </Badge>
            <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50">
              🔴 Difícil: {hardCount}
            </Badge>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Creado: {formattedDate}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link href={`/documentos/${id}`} className="flex-1">
            <Button className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Eye size={16} />
              Ver Detalles
            </Button>
          </Link>
          
          {onDelete && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.preventDefault();
                onDelete(id);
              }}
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
