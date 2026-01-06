'use client';

import { motion } from 'framer-motion';
import { FileText, Calendar, BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DocumentWithExams } from '@/types/django-api';
import { getStatusBadge, formatFileSize } from '@/utils/document-status';

interface DocumentCardProps {
  document: DocumentWithExams;
  index: number;
}

export function DocumentCard({ document, index }: DocumentCardProps) {
  const statusBadge = getStatusBadge(document.processingStatus);
  
  const formattedDate = new Date(document.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Link href={`/documentos/${document.id}`}>
        <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-purple-300 dark:hover:border-purple-700">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {document.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(document.size)} • {document.num_pages} {document.num_pages === 1 ? 'página' : 'páginas'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            <Badge className={`${statusBadge.color} border-0`}>
              {statusBadge.icon} {statusBadge.label}
            </Badge>
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>
                {document.examCount === 0 ? 'Sin exámenes' : 
                 document.examCount === 1 ? '1 examen' : 
                 `${document.examCount} exámenes`}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Click para ver detalles
            </span>
            <Download className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
