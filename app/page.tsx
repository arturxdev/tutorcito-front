'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, FileText, BookOpen } from 'lucide-react';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuizStore } from '@/store/quizStore';
import { toast } from 'sonner';
import { playSound, SOUNDS } from '@/utils/sounds';
import { getDocuments, getExams, getExamsByDocument, getQuestionsByExam } from '@/lib/api/django-api';
import { DjangoDocument, DjangoExam } from '@/types/django-api';
import { transformDjangoQuestions } from '@/lib/utils/transform-api-data';

export default function Home() {
  const router = useRouter();
  const { setQuiz, setLoading, isLoading, resetQuiz } = useQuizStore();
  
  // Estado para documentos y exámenes
  const [documents, setDocuments] = useState<DjangoDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [allExams, setAllExams] = useState<DjangoExam[]>([]);
  const [availableExams, setAvailableExams] = useState<DjangoExam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Cargar documentos al montar
  useEffect(() => {
    loadDocuments();
  }, []);

  // Cargar exámenes cuando se selecciona un documento
  useEffect(() => {
    if (selectedDocumentId !== null) {
      const exams = getExamsByDocument(allExams, selectedDocumentId);
      // Filtrar solo exámenes completados
      const completedExams = exams.filter(exam => exam.status === 'done');
      setAvailableExams(completedExams);
      setSelectedExamId(null); // Reset exam selection
    } else {
      setAvailableExams([]);
      setSelectedExamId(null);
    }
  }, [selectedDocumentId, allExams]);

  const loadDocuments = async () => {
    setIsLoadingData(true);
    try {
      const [docs, exams] = await Promise.all([
        getDocuments(),
        getExams(),
      ]);
      setDocuments(docs);
      setAllExams(exams);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error cargando documentos y exámenes');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleStartQuiz = async () => {
    if (selectedExamId === null) {
      toast.error('Por favor selecciona un examen');
      return;
    }

    console.log('🎯 [Home] Iniciando examen...');
    
    // Reset any existing quiz/attempt before starting a new one
    resetQuiz();
    
    setLoading(true);
    playSound(SOUNDS.CLICK);

    try {
      // Obtener preguntas del examen
      const questions = await getQuestionsByExam(selectedExamId);
      
      if (!questions || questions.length === 0) {
        throw new Error('No se encontraron preguntas para este examen');
      }

      // Obtener datos del examen y documento para el nombre
      const selectedExam = allExams.find(e => e.id === selectedExamId);
      const selectedDocument = documents.find(d => d.id === selectedDocumentId);
      
      if (!selectedExam || !selectedDocument) {
        throw new Error('Error obteniendo datos del examen');
      }

      // Transformar preguntas al formato interno
      const quiz = transformDjangoQuestions(questions, selectedExam, selectedDocument);
      
      console.log('📦 [Home] Quiz generado:', quiz);
      console.log('📊 [Home] Total de preguntas:', quiz.questions.length);
      
      setQuiz(quiz);
      
      toast.success('¡Quiz cargado exitosamente!');
      playSound(SOUNDS.COMPLETE);
      
      // Navigate to quiz page
      setTimeout(() => {
        router.push('/quiz');
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error cargando el quiz. Por favor intenta de nuevo.';
      toast.error(errorMessage);
      playSound(SOUNDS.INCORRECT);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <motion.h2
            className="text-2xl md:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Aprende Jugando con IA
          </motion.h2>
          <motion.p
            className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Selecciona un documento y examen disponible.
            Pon a prueba tus conocimientos de manera interactiva.
          </motion.p>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Seleccionar Documento */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              1. Selecciona un Documento
            </h3>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
              <Label htmlFor="document-select" className="text-base font-medium mb-3 block flex items-center gap-2">
                <FileText size={18} />
                Documentos Disponibles
              </Label>
              <select
                id="document-select"
                value={selectedDocumentId || ''}
                onChange={(e) => setSelectedDocumentId(e.target.value ? Number(e.target.value) : null)}
                disabled={isLoading || isLoadingData}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Selecciona un documento --</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} ({doc.num_pages} páginas)
                  </option>
                ))}
              </select>
              {isLoadingData && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando documentos...
                </p>
              )}
            </div>
          </motion.div>

          {/* Seleccionar Examen */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              2. Selecciona un Examen
            </h3>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700">
              <Label htmlFor="exam-select" className="text-base font-medium mb-3 block flex items-center gap-2">
                <BookOpen size={18} />
                Exámenes Disponibles
              </Label>
              <select
                id="exam-select"
                value={selectedExamId || ''}
                onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : null)}
                disabled={isLoading || !selectedDocumentId || availableExams.length === 0}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Selecciona un examen --</option>
                {availableExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    Páginas {exam.page_start}-{exam.page_end} • {exam.num_questions} preguntas
                  </option>
                ))}
              </select>
              {selectedDocumentId && availableExams.length === 0 && !isLoadingData && (
                <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                  No hay exámenes disponibles para este documento.
                </p>
              )}
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            className="flex justify-center pt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              size="lg"
              onClick={handleStartQuiz}
              disabled={!selectedExamId || isLoading}
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Cargando Examen...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Iniciar Examen
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            className="mt-8 p-6 rounded-xl bg-blue-100 dark:bg-blue-950/30 border border-blue-300 dark:border-blue-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              <Sparkles size={20} />
              Cómo funciona
            </h4>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li>• Selecciona un documento de los disponibles en el sistema</li>
              <li>• Elige un examen que cubra las páginas que quieres estudiar</li>
              <li>• Responderás todas las preguntas del examen seleccionado</li>
              <li>• Las preguntas están distribuidas en tres niveles: fácil, media y difícil</li>
              <li>• Al finalizar, podrás revisar tus respuestas y ver las correctas</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


