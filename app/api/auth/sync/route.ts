import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Endpoint para sincronizar usuario con Django backend
 * Django automáticamente creará el usuario si no existe cuando valida el token
 */
export async function GET() {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No authenticated session' },
        { status: 401 }
      );
    }

    // Llamar al endpoint de Django que valida el token y crea/actualiza el usuario
    const response = await fetch(`${API_BASE_URL}/api/auth/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Django sync failed: ${response.statusText}`);
    }

    const userData = await response.json();

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Error syncing user with Django:', error);
    return NextResponse.json(
      { error: 'Failed to sync user' },
      { status: 500 }
    );
  }
}
