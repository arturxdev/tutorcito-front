'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DocumentDetailHeader } from '@/components/documents/DocumentDetailHeader';
import { ExamCard } from '@/components/documents/ExamCard';
import { CreateExamDialog } from '@/components/documents/CreateExamDialog';
import { toast } from 'sonner';
import { getDocumentById, getExams, getQuestionsByExam } from '@/lib/api/django-api';
import { DjangoDocument, DjangoExam, DocumentProcessingStatus } from '@/types/django-api';
import { getDocumentProcessingStatus } from '@/utils/document-status';
import { useQuizStore } from '@/store/quizStore';
import { transformDjangoQuestions } from '@/lib/utils/transform-api-data';
import { playSound, SOUNDS } from '@/utils/sounds';

export default function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { setQuiz, resetQuiz } = useQuizStore();
  
  const [document, setDocument] = useState<DjangoDocument | null>(null);
  const [exams, setExams] = useState<DjangoExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [showCreateExamDialog, setShowCreateExamDialog] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<DocumentProcessingStatus>('processing');

  // Handler para iniciar examen
  const handleStartExam = async (examId: number) => {
    if (!document) {
      toast.error('Documento no encontrado');
      return;
    }

    console.log('🎯 [Document Detail] Iniciando examen...', examId);
    
    // Reset any existing quiz/attempt before starting a new one
    resetQuiz();
    
    setIsLoadingQuiz(true);
    playSound(SOUNDS.CLICK);

    try {
      // Obtener preguntas del examen
      console.log('📡 [Document Detail] Obteniendo preguntas del examen', examId);
      const questions = await getQuestionsByExam(examId);
      
      if (!questions || questions.length === 0) {
        throw new Error('No se encontraron preguntas para este examen');
      }
      
      console.log('✅ [Document Detail] Preguntas obtenidas:', questions.length);

      // Obtener datos del examen de la lista cargada
      const selectedExam = exams.find(e => e.id === examId);
      
      if (!selectedExam) {
        throw new Error('Examen no encontrado');
      }

      // Transformar preguntas al formato interno del quiz
      console.log('🔄 [Document Detail] Transformando preguntas al formato del quiz...');
      const quiz = transformDjangoQuestions(questions, selectedExam, document);
      
      console.log('📦 [Document Detail] Quiz generado:', quiz);
      console.log('📊 [Document Detail] Total de preguntas:', quiz.questions.length);
      console.log('📋 [Document Detail] Distribución:', quiz.config);
      
      // Cargar quiz en el store global
      setQuiz(quiz);
      
      toast.success('¡Examen listo para comenzar!', {
        description: `${quiz.questions.length} preguntas esperándote`,
      });
      playSound(SOUNDS.COMPLETE);
      
      // Navigate to quiz page after short delay (allows toast to be seen)
      setTimeout(() => {
        console.log('🚀 [Document Detail] Navegando a /quiz');
        router.push('/quiz');
      }, 500);
    } catch (error) {
      console.error('❌ [Document Detail] Error al iniciar examen:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error cargando el examen. Por favor intenta de nuevo.';
      toast.error(errorMessage);
      playSound(SOUNDS.INCORRECT);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  // Fetch document and exams
  const fetchData = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const [docData, examsData] = await Promise.all([
        getDocumentById(Number(id)),
        getExams(Number(id)),
      ]);

      setDocument(docData);
      setExams(examsData);
      setProcessingStatus(getDocumentProcessingStatus(docData, examsData));
    } catch (error) {
      console.error('Error fetching document:', error);
      if (!silent) {
        toast.error(error instanceof Error ? error.message : 'Error al cargar el documento');
        router.push('/documentos');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [id]);

  // Auto-refresh when there are processing exams
  useEffect(() => {
    const hasProcessingExams = exams.some(exam => exam.status === 'process');
    
    if (hasProcessingExams) {
      console.log('🔄 Auto-refresh enabled: exams are processing');
      const interval = setInterval(() => {
        console.log('🔄 Refreshing exam status...');
        fetchData(true); // Silent refresh
      }, 10000); // Every 10 seconds

      return () => {
        console.log('🔄 Auto-refresh disabled');
        clearInterval(interval);
      };
    }
  }, [exams]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando documento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/documentos">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft size={16} />
            Volver a Documentos
          </Button>
        </Link>

        <DocumentDetailHeader 
          document={document} 
          examCount={exams.length}
          processingStatus={processingStatus}
        />

        {/* Action Button */}
        <div className="mt-6">
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => setShowCreateExamDialog(true)}
          >
            <Plus size={20} />
            Generar Examen
          </Button>
        </div>
      </div>

      {/* Exams Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Exámenes Generados
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {exams.length === 0
                  ? 'Aún no has generado exámenes para este documento'
                  : `${exams.length} ${exams.length === 1 ? 'examen generado' : 'exámenes generados'}`}
              </p>
            </div>
            
            {isRefreshing && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Actualizando...</span>
              </div>
            )}
          </div>

          {exams.length > 0 ? (
            <>
              {/* Processing Notice */}
              {exams.some(exam => exam.status === 'process') && (
                <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Loader2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 animate-spin flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                        Generación de preguntas en progreso
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Los exámenes se están procesando. La página se actualizará automáticamente cada 10 segundos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {exams.map((exam) => (
                  <ExamCard 
                    key={exam.id} 
                    exam={exam} 
                    onStartExam={handleStartExam}
                    isLoadingQuiz={isLoadingQuiz}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No hay exámenes generados todavía
              </p>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowCreateExamDialog(true)}
              >
                <Plus size={16} />
                Generar Primer Examen
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Create Exam Dialog */}
      {document && (
        <CreateExamDialog
          document={document}
          open={showCreateExamDialog}
          onOpenChange={setShowCreateExamDialog}
          onSuccess={fetchData}
        />
      )}

      {/* Loading Overlay - Shown while quiz is being loaded */}
      {isLoadingQuiz && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-sm"
          >
            <Card className="p-8">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  Cargando Examen
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preparando las preguntas...
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
