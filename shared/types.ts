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
    datedeleted: Date
    mediaGroups: string[]
    productStatus: string
    trelloData: TrelloDataSchema
    youtubeData: YouTubeDataSchema
    crowdinData: CrowdinDataSchema
}


export interface GetProductFilters {
    targetLanguage?: string
    dateFrom?: string
    dateTo?: string
    productCode?: string
    mediaGroups?: string[]
    search: string | undefined
    limit?: number
    offset?: number
    archivedOnly?: boolean
    publishedOnly?: boolean
    unpublishedOnly?: boolean
    excludeDeleted?: boolean
}


export interface ProductMetaFilters {
    targetLanguage?: string | undefined
    dateFrom?: string | undefined
    dateTo?: string | undefined
    productCode?: string | undefined
    mediaGroups?: string[] | undefined

}

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


export interface RawTrelloCard {
  id: string
  name: string
  labels?: [
    {
        id: string
        name: string
    }
  ]
  due?: string | null
  dateLastActivity: string
  url: string
  isTemplate: string
  dateClosed?: string
  actions: [
    {
        data: {
            checkItem?: {
                id: string
                name: string
                state: string
            }
        }
        type: string
        date: string
    }
  ]
  attachments?: [
    {
        name: string
        url: string
    }
  ]
  customFieldItems?: [
    {
        idCustomField: string
        value: {
            checked?: string
            text?: string
        }
    }
  ]
  idLabels: string[]
}


export interface RawYouTubeData {
    /**
     * Defines the shape of a raw YouTube Data V3 API response,
     * extracting localized title and duration to be added to LangOps product.
     * Note that duration will be in format PT00M00S, where 'M' is minutes and 
     * 'S' is seconds; this will need to be parsed in the class getter.
    */
   items: [
    {
        snippet: {
            localized: {
                title: string
            }
        }
        contentDetails: {
            duration: string
        }
    }
   ]
}

// TODO: Define shape of Crowdin raw data fetch
export interface RawCrowdinData {

}


export type CrowdinProject = {
    id: number
    name: string
    targetLanguages: { id: string; name: string }[]
}

