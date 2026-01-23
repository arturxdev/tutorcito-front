"use client";

import { useState } from "react";
import Link from "next/link";
import { Button3D } from "@/components/ui/button-3d";
import { Card3D } from "@/components/ui/card-3d";
import { Plus, BookOpen, FileQuestion, Upload } from "lucide-react";
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

  const displayName =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "Usuario";

  return (
    <div className="container max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
          Hola, {displayName}!{" "}
          <span className="inline-block text-3xl sm:text-4xl md:text-5xl">👋</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
          Bienvenido a tu espacio de aprendizaje
        </p>
      </div>

      <div className="mb-8">
        {/* Section Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>📚</span>
            <span>Mis Documentos</span>
          </h2>

          {/* Action Buttons - Stack vertical on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button3D
              asChild
              variant="primary"
              className="w-full sm:w-auto min-h-[48px] gap-2"
              size="sm"
            >
              <Link href="/documentos/new">
                <Upload className="w-4 h-4" />
                <span>Subir Documento</span>
              </Link>
            </Button3D>
            <Button3D
              onClick={() => setShowCreateExamDialog(true)}
              disabled={documents.length === 0}
              variant="white"
              className="w-full sm:w-auto min-h-[48px] gap-2"
              size="sm"
            >
              <FileQuestion className="w-4 h-4" />
              <span>Crear Examen</span>
            </Button3D>
          </div>
        </div>

        {/* Empty State */}
        {documents.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#2460FF]/10 to-[#590df2]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-[#2460FF]" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mb-2">
              No tienes documentos aún
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium mb-4 sm:mb-6 max-w-sm mx-auto">
              Sube tu primer documento PDF para generar exámenes con IA
            </p>
            <Button3D
              asChild
              variant="primary"
              className="w-full sm:w-auto min-h-[48px] gap-2"
            >
              <Link href="/documentos/new">
                <Upload className="w-4 h-4" />
                <span>Subir Primer Documento</span>
              </Link>
            </Button3D>
          </div>
        ) : (
          <>
            {/* Document Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {documents.map((document) => (
                <Card3D
                  key={document.id}
                  variant="interactive"
                  className="p-4 sm:p-5 group cursor-pointer"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br bg-gray-600  flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-base text-gray-900 dark:text-white mb-1 truncate group-hover:text-[#2460FF] transition-colors">
                        {document.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        {document.num_pages} {document.num_pages === 1 ? 'página' : 'páginas'}
                      </p>
                    </div>
                  </div>
                </Card3D>
              ))}
            </div>

            {/* View All Button */}
            {documents.length > 6 && (
              <div className="mt-6 text-center">
                <Button3D
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px]"
                >
                  <Link href="/documentos">
                    Ver Todos los Documentos
                  </Link>
                </Button3D>
              </div>
            )}
          </>
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
