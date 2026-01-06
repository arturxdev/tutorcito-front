'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, FileQuestion, BarChart3 } from 'lucide-react';
import { CreateExamDialog } from './CreateExamDialog';
import type { QuestionBank } from '@/types/question-bank';
import type { DjangoDocument } from '@/types/django-api';

interface UserData {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  imageUrl: string;
}

interface DashboardContentProps {
  user: UserData;
  banks: QuestionBank[];
  documents: DjangoDocument[];
}

export default function DashboardContent({ user, banks, documents }: DashboardContentProps) {
  const [showCreateExamDialog, setShowCreateExamDialog] = useState(false);

  const totalBanks = banks.length;
  const totalQuestions = banks.reduce((sum, bank) => sum + bank.totalQuestions, 0);

  const displayName = user?.firstName || user?.emailAddresses[0]?.emailAddress?.split('@')[0] || 'Usuario';

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Hola, {displayName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Bienvenido a tu espacio de aprendizaje
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Documentos</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalBanks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileQuestion className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Preguntas</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Exámenes</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            📚 Mis Documentos
          </h2>
          <div className="flex gap-3">
            <Link href="/documentos/new">
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus size={20} />
                Subir Documento
              </Button>
            </Link>
            <Button
              onClick={() => setShowCreateExamDialog(true)}
              disabled={documents.length === 0}
              className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              <FileQuestion size={20} />
              Crear Examen
            </Button>
          </div>
        </div>

        {banks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              No tienes documentos aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Sube tu primer documento PDF para generar exámenes
            </p>
            <Link href="/documentos/new">
              <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus size={20} />
                Subir Primer Documento
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.slice(0, 6).map((bank) => (
              <Link
                key={bank.id}
                href={`/documentos/${bank.id}`}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate">
                  📄 {bank.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{bank.totalQuestions} preguntas</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                    🟢 {bank.easyCount}
                  </span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded">
                    🟡 {bank.mediumCount}
                  </span>
                  <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">
                    🔴 {bank.hardCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {banks.length > 6 && (
          <div className="mt-6 text-center">
            <Link href="/documentos">
              <Button variant="outline">Ver Todos los Documentos</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Create Exam Dialog */}
      <CreateExamDialog
        documents={documents}
        open={showCreateExamDialog}
        onOpenChange={setShowCreateExamDialog}
      />
    </div>
  );
}
