import { z } from 'zod';

export const DocumentDTOSchema = z.object({
    id: z.number(),
    url: z.string(),
    name: z.string(),
    size: z.number(),
    content_type: z.string(),
    r2_key: z.string(),
    hash_md5: z.string(),
    num_pages: z.number(),
    created_at: z.string(),
    user: z.number(),
}).transform((data) => ({
    ...data,
    created_at: new Date(data.created_at),
}));

export const DocumentDTOListSchema = z.array(DocumentDTOSchema);
export type DocumentDTO = z.infer<typeof DocumentDTOSchema>;
