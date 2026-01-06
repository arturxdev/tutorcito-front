'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Loader2, CheckCircle2, XCircle, Play } from 'lucide-react';
import type { DjangoExam } from '@/types/django-api';

interface ExamCardProps {
  exam: DjangoExam;
  onStartExam?: (examId: number) => void;
  isLoadingQuiz?: boolean;
}

export function ExamCard({ exam, onStartExam, isLoadingQuiz = false }: ExamCardProps) {
  const formattedDate = new Date(exam.created_at).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const getStatusBadge = () => {
    switch (exam.status) {
      case 'done':
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completado
          </Badge>
        );
      case 'process':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Procesando
          </Badge>
        );
      case 'fail':
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0">
            <XCircle className="w-3 h-3 mr-1" />
            Fallido
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">
              Páginas {exam.page_start} - {exam.page_end}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {exam.num_questions} {exam.num_questions === 1 ? 'pregunta' : 'preguntas'}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>

        {exam.status === 'done' && onStartExam && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStartExam(exam.id)}
            disabled={isLoadingQuiz}
            className="gap-2"
          >
            {isLoadingQuiz ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Iniciar Examen
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
