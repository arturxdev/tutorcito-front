import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { 
  getQuestionBank, 
  deleteQuestionBank,
  getQuestionBankWithQuestions 
} from '@/lib/db/queries/question-banks';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
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
    
    const { id } = await params;
    
    // Get bank with questions and answers
    const bank = await getQuestionBankWithQuestions(id, user.id);
    
    if (!bank) {
      return NextResponse.json(
        { success: false, error: 'Banco no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      bank,
    });
  } catch (error) {
    console.error('Error fetching question bank:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al obtener el banco';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
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
    
    const { id } = await params;
    
    // Get bank first to check ownership and get PDF path
    const bank = await getQuestionBank(id, user.id);
    
    if (!bank) {
      return NextResponse.json(
        { success: false, error: 'Banco no encontrado' },
        { status: 404 }
      );
    }
    
    // Delete from database (will cascade to questions and answers)
    await deleteQuestionBank(id, user.id);
    
    // Delete PDF from storage if it exists
    // Note: The storage path is constructed as {userId}/{bankId}/{filename}
    // We need to extract the path from the pdfUrl or construct it
    // For now, we'll skip PDF deletion to avoid errors if path is wrong
    // TODO: Store the storage path in the database for easier deletion
    
    console.log(`Question bank deleted: ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Banco eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error deleting question bank:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el banco';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
