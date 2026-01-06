'use client';

import { Calendar, FileText, Download, Layers } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DjangoDocument } from '@/types/django-api';
import { formatFileSize, getStatusBadge } from '@/utils/document-status';
import type { DocumentProcessingStatus } from '@/types/django-api';

interface DocumentDetailHeaderProps {
  document: DjangoDocument;
  examCount: number;
  processingStatus: DocumentProcessingStatus;
}

export function DocumentDetailHeader({ document, examCount, processingStatus }: DocumentDetailHeaderProps) {
  const statusBadge = getStatusBadge(processingStatus);
  
  const formattedDate = new Date(document.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {document.name}
            </h2>
            <Badge className={`${statusBadge.color} border-0`}>
              {statusBadge.icon} {statusBadge.label}
            </Badge>
          </div>
        </div>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <a href={document.url} target="_blank" rel="noopener noreferrer" download>
            <Download className="w-4 h-4" />
            Descargar PDF
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tamaño</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {formatFileSize(document.size)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Páginas</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {document.num_pages}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Exámenes</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {examCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
              {formattedDate}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
