/**
 * Cliente HTTP base con autenticación
 * Shared layer - sin lógica de negocio específica
 */

import { redirect } from 'next/navigation'
import { env } from '@shared/config'

type TokenGetter = () => Promise<string | null>

let tokenGetter: TokenGetter | null = null

export function setTokenGetter(getter: TokenGetter) {
    tokenGetter = getter
}

async function getToken(directToken?: string | null): Promise<string | null> {
    if (directToken !== undefined) return directToken
    if (tokenGetter) return await tokenGetter()
    return null
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string | null
): Promise<T> {
    const authToken = await getToken(token)

    if (!authToken) {
        if (typeof window === 'undefined') {
            redirect('/sign-in')
        }
        window.location.href = '/sign-in'
        throw new ApiError('No authentication token available', 401)
    }

    const url = `${env.API_BASE_URL}${endpoint}`

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
        'Authorization': `Bearer ${authToken}`,
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401) {
        if (typeof window === 'undefined') {
            redirect('/sign-in')
        }
        window.location.href = '/sign-in'
        throw new ApiError('Unauthorized', 401)
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
            errorData.error || `Request failed with status ${response.status}`,
            response.status,
            errorData
        )
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
        return undefined as T
    }

    return response.json()
}


/**
 * Fetch wrapper con autenticación automática
 * @param url - URL del endpoint
 * @param options - Opciones de fetch
 * @param token - Token opcional para Server Components (usa auth().getToken())
 */
export async function authenticatedFetch(
    url: string,
    options: RequestInit = {},
    token?: string | null
) {

    const authToken = await getToken(token);

    if (!authToken) {
        console.error('❌ [Django API] No token available - cannot make authenticated request');

        // Si estamos en servidor, redirigir con next/navigation
        if (typeof window === 'undefined') {
            redirect('/sign-in');
        }

        // Si estamos en cliente, usar window.location
        window.location.href = '/sign-in';
        throw new Error('No authentication token available');
    }

    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };

    headers['Authorization'] = `Bearer ${authToken}`;


    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        console.error('❌ [Django API] Unauthorized (401) - Token invalid or expired');

        // Si estamos en servidor, redirigir con next/navigation
        if (typeof window === 'undefined') {
            console.error('❌ [Django API] Server-side: Redirecting to sign-in...');
            redirect('/sign-in');
        }

        // Si estamos en cliente, usar window.location
        console.error('❌ [Django API] Client-side: Redirecting to sign-in...');
        window.location.href = '/sign-in';
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Django API] Request failed');
        console.error('❌ [Django API] Status:', response.status);
        console.error('❌ [Django API] Response body:', errorText);
    }

    return response;
}
