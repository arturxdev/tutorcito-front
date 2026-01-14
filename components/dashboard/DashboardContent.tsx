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

  const displayName =
    user?.firstName ||
    user?.emailAddresses[0]?.emailAddress?.split("@")[0] ||
    "Usuario";

  return (
    <div className="container max-w-4/5 mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
          Hola, {displayName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-medium">
          Bienvenido a tu espacio de aprendizaje
        </p>
      </div>

      <div className="mb-8">
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
              variant="white"
              className="gap-2"
              size="sm"
            >
              <FileQuestion size={20} />
              Crear Examen
            </Button3D>
          </div>
        </div>

        {documents.length === 0 ? (
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
            {documents.map((document) => (
              // <Link key={document.id} href={`/documentos/${document.id}`}>
              <Card3D variant="interactive" className="p-4">
                <p className="font-bold text-gray-900 dark:text-white mb-2 truncate">
                  {document.name}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 font-medium">
                  <span>{document.num_pages} paginas</span>
                </div>
              </Card3D>
              // </Link>
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
