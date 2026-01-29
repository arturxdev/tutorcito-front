export interface DocumentModel {
    id: number;
    url: string;
    name: string;
    size: number;
    content_type: string;
    r2_key: string;
    hash_md5: string;
    num_pages: number;
    created_at: Date;
    user: number;
}