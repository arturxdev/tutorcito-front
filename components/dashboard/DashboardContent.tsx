"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Button3D } from "@/components/ui/button-3d";
import { Card3D } from "@/components/ui/card-3d";
import { Plus, BookOpen, FileQuestion, BarChart3 } from "lucide-react";
import { CreateExamDialog } from "./CreateExamDialog";
import type { QuestionBank } from "@/types/question-bank";
import type { DjangoDocument } from "@/types/django-api";

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

export default function DashboardContent({
  user,
  banks,
  documents,
}: DashboardContentProps) {
  const [showCreateExamDialog, setShowCreateExamDialog] = useState(false);

  const totalBanks = banks.length;
  const totalQuestions = banks.reduce(
    (sum, bank) => sum + bank.totalQuestions,
    0
  );

  const displayName =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "Usuario";

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
          Hola, {displayName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Bienvenido a tu espacio de aprendizaje
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card3D className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <BookOpen className="w-6 h-6 text-[#590df2]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Documentos
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {totalBanks}
              </p>
            </div>
          </div>
        </Card3D>

        <Card3D className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileQuestion className="w-6 h-6 text-[#1368ce]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Total Preguntas
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                {totalQuestions}
              </p>
            </div>
          </div>
        </Card3D>

        <Card3D className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <BarChart3 className="w-6 h-6 text-[#26890c]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Exámenes
              </p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </Card3D>
      </div>

      {/* Quick Actions */}
      <Card3D className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">
            📚 Mis Documentos
          </h2>
          <div className="flex gap-3">
            <Link href="/documentos/new">
              <Button3D variant="primary" className="gap-2" size="sm">
                <Plus size={20} />
                Subir Documento
              </Button3D>
            </Link>
            <Button3D
              onClick={() => setShowCreateExamDialog(true)}
              disabled={documents.length === 0}
              variant="red"
              className="gap-2"
              size="sm"
            >
              <FileQuestion size={20} />
              Crear Examen
            </Button3D>
          </div>
        </div>

        {banks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
              No tienes documentos aún
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-6">
              Sube tu primer documento PDF para generar exámenes
            </p>
            <Link href="/documentos/new">
              <Button3D variant="primary" className="gap-2">
                <Plus size={20} />
                Subir Primer Documento
              </Button3D>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {banks.slice(0, 6).map((bank) => (
              <Link key={bank.id} href={`/documentos/${bank.id}`}>
                <Card3D variant="interactive" className="p-4">
                  <h3 className="font-black text-gray-900 dark:text-white mb-2 truncate">
                    📄 {bank.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                    <span>{bank.totalQuestions} preguntas</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-bold">
                      🟢 {bank.easyCount}
                    </span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded font-bold">
                      🟡 {bank.mediumCount}
                    </span>
                    <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded font-bold">
                      🔴 {bank.hardCount}
                    </span>
                  </div>
                </Card3D>
              </Link>
            ))}
          </div>
        )}

        {banks.length > 6 && (
          <div className="mt-6 text-center">
            <Link href="/documentos">
              <Button3D variant="outline">Ver Todos los Documentos</Button3D>
            </Link>
          </div>
        )}
      </Card3D>

      {/* Create Exam Dialog */}
      <CreateExamDialog
        documents={documents}
        open={showCreateExamDialog}
        onOpenChange={setShowCreateExamDialog}
      />
    </div>
  );
}
