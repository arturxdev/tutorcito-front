import { createClient } from './server';

/**
 * Uploads a PDF file to Supabase Storage
 * @param userId - The ID of the user uploading the file
 * @param file - The PDF file to upload
 * @param bankId - Optional question bank ID (generates one if not provided)
 * @returns Object with the public URL and storage path
 */
export async function uploadPDF(
  userId: string,
  file: File,
  bankId?: string
): Promise<{ url: string; path: string }> {
  const supabase = await createClient();
  
  // Generate bank ID if not provided
  const id = bankId || crypto.randomUUID();
  
  // Create unique file path: {userId}/{bankId}/{filename}
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
  const filePath = `${userId}/${id}/${fileName}`;
  
  // Upload file to Supabase Storage
  const { error } = await supabase.storage
    .from('pdfs')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
  
  if (error) {
    console.error('Storage upload error:', error);
    throw new Error(`Failed to upload PDF: ${error.message}`);
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(filePath);
  
  return {
    url: publicUrl,
    path: filePath,
  };
}

/**
 * Deletes a PDF file from Supabase Storage
 * @param path - The storage path of the file to delete
 */
export async function deletePDF(path: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.storage
    .from('pdfs')
    .remove([path]);
  
  if (error) {
    console.error('Storage delete error:', error);
    throw new Error(`Failed to delete PDF: ${error.message}`);
  }
}

/**
 * Gets the public URL for a PDF file
 * @param path - The storage path of the file
 * @returns The public URL
 */
export async function getPDFUrl(path: string): Promise<string> {
  const supabase = await createClient();
  
  const { data: { publicUrl } } = supabase.storage
    .from('pdfs')
    .getPublicUrl(path);
  
  return publicUrl;
}
