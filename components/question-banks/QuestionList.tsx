'use client';

import { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { QuestionItem } from './QuestionItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
}

interface QuestionListProps {
  questions: Question[];
  selectedQuestionIds: string[];
  onSelectionChange: (ids: string[]) => void;
  showSelection?: boolean;
}

type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export function QuestionList({
  questions,
  selectedQuestionIds,
  onSelectionChange,
  showSelection = false,
}: QuestionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  // Filter questions
  const filteredQuestions = useMemo(() => {
    let filtered = questions;

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficultyFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((q) =>
        q.questionText.toLowerCase().includes(query) ||
        q.answers.some((a) => a.text.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [questions, difficultyFilter, searchQuery]);

  const handleSelectAll = () => {
    if (selectedQuestionIds.length === filteredQuestions.length) {
      // Deselect all
      onSelectionChange([]);
    } else {
      // Select all filtered
      onSelectionChange(filteredQuestions.map((q) => q.id));
    }
  };

  const handleSelect = (id: string) => {
    if (selectedQuestionIds.includes(id)) {
      onSelectionChange(selectedQuestionIds.filter((qid) => qid !== id));
    } else {
      onSelectionChange([...selectedQuestionIds, id]);
    }
  };

  const allSelected = filteredQuestions.length > 0 && selectedQuestionIds.length === filteredQuestions.length;
  const someSelected = selectedQuestionIds.length > 0 && selectedQuestionIds.length < filteredQuestions.length;

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar en preguntas y respuestas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={20} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Dificultad:
          </span>
          <div className="flex gap-2">
            <Button
              variant={difficultyFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('all')}
            >
              Todas ({questions.length})
            </Button>
            <Button
              variant={difficultyFilter === 'easy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('easy')}
              className="gap-1"
            >
              🟢 Fácil ({questions.filter((q) => q.difficulty === 'easy').length})
            </Button>
            <Button
              variant={difficultyFilter === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('medium')}
              className="gap-1"
            >
              🟡 Media ({questions.filter((q) => q.difficulty === 'medium').length})
            </Button>
            <Button
              variant={difficultyFilter === 'hard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficultyFilter('hard')}
              className="gap-1"
            >
              🔴 Difícil ({questions.filter((q) => q.difficulty === 'hard').length})
            </Button>
          </div>
        </div>

        {/* Selection Controls */}
        {showSelection && (
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(el) => {
                  if (el) el.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
                className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {allSelected ? 'Deseleccionar todas' : 'Seleccionar todas'}
              </span>
            </div>
            {selectedQuestionIds.length > 0 && (
              <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                {selectedQuestionIds.length} seleccionada{selectedQuestionIds.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results Info */}
      {searchQuery && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredQuestions.length} resultado{filteredQuestions.length !== 1 ? 's' : ''} encontrado{filteredQuestions.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            No se encontraron preguntas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Intenta con otros términos de búsqueda o filtros
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              isSelected={selectedQuestionIds.includes(question.id)}
              onSelect={handleSelect}
              showSelection={showSelection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
