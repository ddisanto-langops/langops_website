import * as z from "zod";
declare const TrelloDataSchema: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
    title: z.ZodString;
    localizedTitle: z.ZodString;
    productCode: z.ZodNullable<z.ZodString>;
    targetLanguage: z.ZodNullable<z.ZodString>;
    dueDate: z.ZodNullable<z.ZodISODateTime>;
    datePublished: z.ZodNullable<z.ZodISODateTime>;
    dateLastActivity: z.ZodNullable<z.ZodISODateTime>;
    dateArchived: z.ZodNullable<z.ZodISODateTime>;
    mediaGroups: z.ZodArray<z.ZodString>;
    editorUrl: z.ZodNullable<z.ZodString>;
    articleUrl: z.ZodNullable<z.ZodString>;
    wordCount: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
declare const YouTubeDataSchema: z.ZodObject<{
    id: z.ZodString;
    localizedTitle: z.ZodNullable<z.ZodString>;
    url: z.ZodString;
    durationSeconds: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
declare const CrowdinDataSchema: z.ZodObject<{
    id: z.ZodString;
    translationProgress: z.ZodNullable<z.ZodNumber>;
    approvalProgress: z.ZodNullable<z.ZodNumber>;
    crowdinUrl: z.ZodString;
}, z.core.$strip>;
export type TrelloDataSchema = z.infer<typeof TrelloDataSchema>;
export type YouTubeDataSchema = z.infer<typeof YouTubeDataSchema>;
export type CrowdinDataSchema = z.infer<typeof CrowdinDataSchema>;
export interface LangOpsProduct {
    id: string;
    dateCreated: Date;
    dateDeleted: Date;
    mediaGroups: string[];
    productStatus: string;
    trelloData: TrelloDataSchema;
    youtubeData: YouTubeDataSchema;
    crowdinData: CrowdinDataSchema;
}
export interface GetProductFilters {
    targetLanguages?: string[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    productCodes?: string[] | undefined;
    mediaGroups?: string[] | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    status?: string[] | undefined;
}
export interface ProductMetaFilters {
    targetLanguages?: string[] | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    productCodes?: string[] | undefined;
    mediaGroups?: string[] | undefined;
}
export interface EditProductRequest {
    date_created?: string | undefined;
    date_deleted?: string | undefined;
    media_groups?: string[] | undefined;
    product_status?: string | undefined;
    trello_id?: string | undefined;
    trello_url?: string | undefined;
    trello_title?: string | undefined;
    trello_localized_title?: string | undefined;
    trello_product_code?: string | undefined;
    trello_target_language?: string | undefined;
    trello_due_date?: string | undefined;
    trello_date_published?: string | undefined;
    trello_date_last_activity?: string | undefined;
    trello_date_archived?: string | undefined;
    trello_editor_url?: string | undefined;
    trello_article_url?: string | undefined;
    trello_word_count?: number | undefined;
    youtube_id?: string | undefined;
    youtube_localized_title?: string | undefined;
    youtube_url?: string | undefined;
    youtube_duration_seconds?: number | undefined;
    crowdin_file_id?: number | undefined;
    crowdin_project_id?: number | undefined;
    crowdin_translation_progress?: number | undefined;
    crowdin_approval_progress?: number | undefined;
    crowdin_url?: string | undefined;
}
/**
 * ----------------------------------------------
 * RESPONSES
 * ----------------------------------------------
*/
export interface PaginatedProductResponse {
    total: number;
    offset: number;
    limit: number;
    data: LangOpsProduct[];
}
export interface WordCountResponse {
    totalWords: number;
}
export interface ProductCountResponse {
    totalProducts: number;
    data: [
        {
            productCode: string;
            count: number;
        }
    ];
}
export interface StringMapItem {
    contextIdentifier: string;
    map: {
        stringIds: number[];
        strings: string[];
        labelText: string | null;
    };
}
export interface StringMapResponse {
    data: StringMapItem[];
}
export interface RestoreResponse {
    id: string;
    restored_at: string;
}
export interface DeleteResponse {
    id: string;
    deleted_at: string;
}
export interface WebhookFailure {
    id: string;
    dateCreated: string;
    statusCode: string;
    data: {
        action: {
            data: {
                card: {
                    name: string;
                };
            };
        };
    };
}
export declare class LangOpsApiError extends Error {
    errorCode: number;
    constructor(errorCode: number, message: string);
}
export {};
//# sourceMappingURL=types.d.ts.map