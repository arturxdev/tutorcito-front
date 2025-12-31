import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyBankOwnership } from '@/lib/db/queries/question-banks';
import { deleteQuestions } from '@/lib/db/queries/questions';
import { updateQuestionBankCounts } from '@/lib/db/queries/question-banks';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(
  request: Request,
  { params }: RouteParams
) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }
    
    const { id: bankId } = await params;
    const body = await request.json();
    const { questionIds } = body;
    
    // Validate input
    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Debe proporcionar IDs de preguntas' },
        { status: 400 }
      );
    }
    
    // Verify bank ownership
    const isOwner = await verifyBankOwnership(bankId, user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'Banco no encontrado' },
        { status: 404 }
      );
    }
    
    // Delete questions (cascade deletes answers)
    await deleteQuestions(questionIds);
    
    // Update bank counts
    await updateQuestionBankCounts(bankId);
    
    console.log(`Deleted ${questionIds.length} questions from bank: ${bankId}`);
    
    return NextResponse.json({
      success: true,
      message: `${questionIds.length} pregunta${questionIds.length !== 1 ? 's' : ''} eliminada${questionIds.length !== 1 ? 's' : ''}`,
    });
  } catch (error) {
    console.error('Error deleting questions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar las preguntas';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
