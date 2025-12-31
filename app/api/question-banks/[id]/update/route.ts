import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateQuestionBank } from '@/lib/db/queries/question-banks';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
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
    
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;
    
    // Validate inputs
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json(
          { success: false, error: 'El nombre es obligatorio' },
          { status: 400 }
        );
      }
      
      if (name.length > 100) {
        return NextResponse.json(
          { success: false, error: 'El nombre no puede exceder 100 caracteres' },
          { status: 400 }
        );
      }
    }
    
    if (description !== undefined && description !== null) {
      if (typeof description !== 'string') {
        return NextResponse.json(
          { success: false, error: 'La descripción debe ser texto' },
          { status: 400 }
        );
      }
      
      if (description.length > 500) {
        return NextResponse.json(
          { success: false, error: 'La descripción no puede exceder 500 caracteres' },
          { status: 400 }
        );
      }
    }
    
    // Update bank
    const updateData: { name?: string; description?: string | null } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    
    const updatedBank = await updateQuestionBank(id, user.id, updateData);
    
    if (!updatedBank) {
      return NextResponse.json(
        { success: false, error: 'Banco no encontrado' },
        { status: 404 }
      );
    }
    
    console.log(`Bank updated: ${id}`);
    
    return NextResponse.json({
      success: true,
      bank: updatedBank,
    });
  } catch (error) {
    console.error('Error updating question bank:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el banco';
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
