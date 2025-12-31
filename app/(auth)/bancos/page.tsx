'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BankCard } from '@/components/question-banks/BankCard';
import { toast } from 'sonner';

interface QuestionBank {
  id: string;
  name: string;
  description: string | null;
  pdfName: string;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  createdAt: string;
}

export default function BancosPage() {
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<QuestionBank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch banks
  useEffect(() => {
    async function fetchBanks() {
      try {
        const response = await fetch('/api/question-banks');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error al cargar los bancos');
        }

        setBanks(data.banks);
        setFilteredBanks(data.banks);
      } catch (error) {
        console.error('Error fetching banks:', error);
        toast.error(error instanceof Error ? error.message : 'Error al cargar los bancos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBanks();
  }, []);

  // Filter banks by search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBanks(banks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.description?.toLowerCase().includes(query) ||
        bank.pdfName.toLowerCase().includes(query)
    );
    setFilteredBanks(filtered);
  }, [searchQuery, banks]);

  // Handle delete
  const handleDelete = async (id: string) => {
    const bank = banks.find((b) => b.id === id);
    if (!bank) return;

    const confirmed = window.confirm(
      `¿Estás seguro de que quieres eliminar "${bank.name}"?\n\nEsto eliminará el banco y todas sus ${bank.totalQuestions} preguntas. Esta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/question-banks/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el banco');
      }

      // Remove from state
      setBanks((prev) => prev.filter((b) => b.id !== id));
      toast.success('Banco eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting bank:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar el banco');
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando bancos de preguntas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Mis Bancos de Preguntas
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {banks.length === 0
                ? 'Aún no tienes bancos creados'
                : `${banks.length} ${banks.length === 1 ? 'banco' : 'bancos'} en total`}
            </p>
          </div>
          <Link href="/bancos/new">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus size={20} />
              Nuevo Banco
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        {banks.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, descripción o PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}
      </div>

      {/* Empty State */}
      {banks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            No tienes bancos de preguntas aún
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Crea tu primer banco subiendo un PDF y deja que la IA genere preguntas de opción múltiple automáticamente.
          </p>
          <Link href="/bancos/new">
            <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Plus size={20} />
              Crear Primer Banco
            </Button>
          </Link>
        </motion.div>
      )}

      {/* No Results */}
      {banks.length > 0 && filteredBanks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
            No se encontraron resultados
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Intenta con otros términos de búsqueda
          </p>
        </motion.div>
      )}

      {/* Banks Grid */}
      {filteredBanks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBanks.map((bank) => (
              <BankCard
                key={bank.id}
                id={bank.id}
                name={bank.name}
                description={bank.description}
                pdfName={bank.pdfName}
                totalQuestions={bank.totalQuestions}
                easyCount={bank.easyCount}
                mediumCount={bank.mediumCount}
                hardCount={bank.hardCount}
                createdAt={new Date(bank.createdAt)}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Footer */}
      {banks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200 dark:border-purple-800"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            📊 Estadísticas Generales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {banks.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Bancos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {banks.reduce((sum, bank) => sum + bank.totalQuestions, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Preguntas Totales</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {banks.reduce((sum, bank) => sum + bank.easyCount, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fáciles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {banks.reduce((sum, bank) => sum + bank.hardCount, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Difíciles</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
