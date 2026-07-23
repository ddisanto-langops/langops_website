import * as z from "zod"

// Sub-domain: Trello
const TrelloDataSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  localizedTitle: z.string(),
  productCode: z.string().nullable(),
  targetLanguage: z.string().nullable(),
  dueDate: z.iso.datetime().nullable(),
  datePublished: z.iso.datetime().nullable(),
  dateLastActivity: z.iso.datetime().nullable(),
  dateArchived: z.iso.datetime().nullable(),
  mediaGroups: z.array(z.string()),
  editorUrl: z.string().nullable(),
  articleUrl: z.string().nullable(),
  wordCount: z.number().int().nullable(),
});

// Sub-domain: YouTube
const YouTubeDataSchema = z.object({
  id: z.string(),
  localizedTitle: z.string().nullable(),
  url: z.string(),
  durationSeconds: z.number().int().nullable(),
});

// Sub-domain: Crowdin
const CrowdinDataSchema = z.object({
  id: z.string(),
  translationProgress: z.number().nullable(),
  approvalProgress: z.number().nullable(),
  url: z.string(),
});



// Extract the TypeScript types from the schemas

export type TrelloDataSchema = z.infer<typeof TrelloDataSchema>
export type YouTubeDataSchema = z.infer<typeof YouTubeDataSchema>
export type CrowdinDataSchema = z.infer<typeof CrowdinDataSchema>

export interface LangOpsProduct {
    id: string
    dateCreated: Date
    dateDeleted: Date
    mediaGroups: string[]
    productStatus: string
    trelloData: TrelloDataSchema
    youtubeData: YouTubeDataSchema
    crowdinData: CrowdinDataSchema
}


export interface GetProductFilters {
    targetLanguage?: string | undefined
    dateFrom?: string | undefined
    dateTo?: string | undefined
    productCode?: string | undefined
    mediaGroups?: string[] | undefined
    search?: string | undefined
    limit?: number | undefined
    offset?: number | undefined
    archivedOnly?: boolean | undefined
    publishedOnly?: boolean | undefined
    unpublishedOnly?: boolean | undefined
    excludeDeleted?: boolean | undefined
}


export interface ProductMetaFilters {
    targetLanguage?: string | undefined
    dateFrom?: string | undefined
    dateTo?: string | undefined
    productCode?: string | undefined
    mediaGroups?: string[] | undefined

}


export interface EditProductRequest {
  date_created?: string | undefined
  date_deleted?: string | undefined
  media_groups?: string[] | undefined
  product_status?: string | undefined
  trello_id?: string | undefined
  trello_url?: string | undefined
  trello_title?: string | undefined
  trello_localized_title?: string | undefined
  trello_product_code?: string | undefined
  trello_target_language?: string | undefined
  trello_due_date?: string | undefined
  trello_date_published?: string | undefined
  trello_date_last_activity?: string | undefined
  trello_date_archived?: string | undefined
  trello_editor_url?: string | undefined
  trello_article_url?: string | undefined
  trello_word_count?: number | undefined
  youtube_id?: string | undefined
  youtube_localized_title?: string | undefined
  youtube_url?: string | undefined
  youtube_duration_seconds?: number | undefined
  crowdin_file_id?: number | undefined
  crowdin_project_id?: number | undefined
  crowdin_translation_progress?: number | undefined
  crowdin_approval_progress?: number | undefined
  crowdin_url?: string | undefined
}



/**
 * ----------------------------------------------
 * RESPONSES
 * ---------------------------------------------- 
*/

export interface PaginatedProductResponse {
    total: number
    offset: number
    limit: number
    data: LangOpsProduct[]
}

export interface WordCountResponse {
    totalWords: number
}


export interface ProductCountResponse {
    totalProducts: number
    data: [
        {
            productCode: string
            count: number
        }
    ]
    
}

export interface RestoreResponse {
    id: string
    restored_at: string
}

export interface DeleteResponse {
    id: string
    deleted_at: string
}