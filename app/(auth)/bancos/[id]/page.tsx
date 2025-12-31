'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Loader2,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { QuestionList } from '@/components/question-banks/QuestionList';
import { EditBankDialog } from '@/components/question-banks/EditBankDialog';
import { DeleteQuestionsDialog } from '@/components/question-banks/DeleteQuestionsDialog';
import { RegenerateQuestionsDialog } from '@/components/question-banks/RegenerateQuestionsDialog';
import { AddQuestionsDialog } from '@/components/question-banks/AddQuestionsDialog';
import { toast } from 'sonner';

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  displayOrder: number;
}

interface Question {
  id: string;
  questionText: string;
  difficulty: 'easy' | 'medium' | 'hard';
  answers: Answer[];
  createdAt: string;
}

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  pdfName: string;
  pdfUrl: string | null;
  customPrompt: string | null;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export default function BankDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [bank, setBank] = useState<QuestionBank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch bank data
  const fetchBank = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/question-banks/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cargar el banco');
      }

      setBank(data.bank);
    } catch (error) {
      console.error('Error fetching bank:', error);
      toast.error(error instanceof Error ? error.message : 'Error al cargar el banco');
      router.push('/bancos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBank();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando banco...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bank) {
    return null;
  }

  const formattedDate = new Date(bank.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const canAddQuestions = bank.totalQuestions < 100;
  const hasSelectedQuestions = selectedQuestionIds.length > 0;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/bancos">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft size={16} />
            Volver a Bancos
          </Button>
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {bank.name}
            </h1>
            {bank.description && (
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {bank.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit size={16} />
            Editar Banco
          </Button>

          {hasSelectedQuestions && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 size={16} />
                Eliminar ({selectedQuestionIds.length})
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setShowRegenerateDialog(true)}
              >
                <RefreshCw size={16} />
                Regenerar ({selectedQuestionIds.length})
              </Button>
            </>
          )}

          {canAddQuestions && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus size={16} />
              Agregar Preguntas
            </Button>
          )}

          <Button
            size="sm"
            className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={() => toast.info('Función en desarrollo')}
          >
            <PlayCircle size={16} />
            Iniciar Examen
          </Button>
        </div>
      </div>

      {/* Bank Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* PDF Info */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            📄 Archivo PDF
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-sm text-blue-900 dark:text-blue-300 font-medium">
                {bank.pdfName}
              </span>
            </div>
            {bank.pdfUrl && (
              <a
                href={bank.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline"
              >
                Ver PDF →
              </a>
            )}
          </div>

          {bank.customPrompt && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                🤖 Instrucciones personalizadas
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                {bank.customPrompt}
              </p>
            </div>
          )}
        </Card>

        {/* Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            📊 Estadísticas
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Total de Preguntas
              </p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {bank.totalQuestions}
              </p>
            </div>

            <div className="flex gap-3">
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 px-4 py-2">
                🟢 Fácil: {bank.easyCount}
              </Badge>
              <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 px-4 py-2">
                🟡 Media: {bank.mediumCount}
              </Badge>
              <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 px-4 py-2">
                🔴 Difícil: {bank.hardCount}
              </Badge>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={16} />
                <span>Creado: {formattedDate}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Questions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Preguntas del Banco
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {bank.totalQuestions === 0 
                ? 'Este banco no tiene preguntas aún'
                : `Explora y gestiona las ${bank.totalQuestions} preguntas de este banco`
              }
            </p>
          </div>

          {bank.questions.length > 0 ? (
            <QuestionList
              questions={bank.questions}
              selectedQuestionIds={selectedQuestionIds}
              onSelectionChange={setSelectedQuestionIds}
              showSelection={true}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No hay preguntas en este banco
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      {bank && (
        <EditBankDialog
          bank={bank}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={fetchBank}
        />
      )}

      {/* Delete Dialog */}
      {bank && (
        <DeleteQuestionsDialog
          bankId={bank.id}
          selectedQuestionIds={selectedQuestionIds}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onSuccess={() => {
            setSelectedQuestionIds([]);
            fetchBank();
          }}
        />
      )}

      {/* Regenerate Dialog */}
      {bank && (
        <RegenerateQuestionsDialog
          bankId={bank.id}
          bankName={bank.name}
          selectedQuestionIds={selectedQuestionIds}
          selectedQuestions={bank.questions.filter(q => selectedQuestionIds.includes(q.id))}
          open={showRegenerateDialog}
          onOpenChange={setShowRegenerateDialog}
          onSuccess={() => {
            setSelectedQuestionIds([]);
            fetchBank();
          }}
        />
      )}

      {/* Add Questions Dialog */}
      {bank && (
        <AddQuestionsDialog
          bankId={bank.id}
          bankName={bank.name}
          currentTotalQuestions={bank.totalQuestions}
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSuccess={fetchBank}
        />
      )}
    </div>
  );
}
