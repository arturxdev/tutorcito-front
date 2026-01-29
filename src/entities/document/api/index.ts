import { authenticatedFetch } from "@/src/shared";
import { env } from "@/src/shared/config";
import { DocumentDTOListSchema, DocumentDTOSchema } from "./dto";
import { DocumentModel } from "../model";

/**
 * Obtiene todos los documentos del usuario
 */
export async function getDocuments(token?: string | null): Promise<DocumentModel[]> {
    const response = await authenticatedFetch(`${env.API_BASE_URL}/api/documents/`, {}, token);
    const data = await response.json();
    const result = DocumentDTOListSchema.safeParse(data);

    if (!result.success) {
        console.error("Error de validación en la API:", result.error);
        throw new Error("Datos del documento corruptos");
    }

    return result.data;
}


/**
 * Sube un documento PDF al backend
 * @param file - Archivo PDF a subir
 */
export async function uploadDocument(file: File): Promise<DocumentModel> {

    const formData = new FormData();
    formData.append('file', file);

    const response = await authenticatedFetch(`${env.API_BASE_URL}/api/documents/upload/`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error al subir documento' }));
        throw new Error(error.error || 'Error al subir documento');
    }

    const data = await response.json();
    const result = DocumentDTOSchema.safeParse(data);

    if (!result.success) {
        console.error("Error de validación en la API:", result.error);
        throw new Error("Datos del documento corruptos");
    }

    return result.data;
}


/**
 * Actualiza un documento (nombre, etc)
 * @param token - Token opcional para Server Components
 */
export async function updateDocument(
    id: number,
    payload: Partial<Pick<DocumentModel, 'name'>>,
): Promise<DocumentModel> {
    const response = await authenticatedFetch(`${env.API_BASE_URL}/api/documents/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Documento no encontrado');
        }
        const error = await response.json().catch(() => ({ error: 'Error al actualizar documento' }));
        throw new Error(error.error || 'Error al actualizar documento');
    }

    const data = await response.json();
    const result = DocumentDTOSchema.safeParse(data);

    if (!result.success) {
        console.error("Error de validación en la API:", result.error);
        throw new Error("Datos del documento corruptos");
    }

    return result.data;
}

/**
 * Elimina un documento
 */
export async function deleteDocument(id: number): Promise<void> {
    const response = await authenticatedFetch(`${env.API_BASE_URL}/api/documents/${id}/`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Documento no encontrado');
        }
        throw new Error('Error al eliminar documento');
    }
}


/**
 * Obtiene un documento por ID
 */
export async function getDocumentById(id: number, token?: string | null): Promise<DocumentModel> {
    const response = await authenticatedFetch(`${env.API_BASE_URL}/api/documents/${id}/`, {}, token);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Documento no encontrado');
        }
        throw new Error('Error al obtener documento');
    }

    const data = await response.json();
    const result = DocumentDTOSchema.safeParse(data);

    if (!result.success) {
        console.error("Error de validación en la API:", result.error);
        throw new Error("Datos del documento corruptos");
    }

    return result.data;
}