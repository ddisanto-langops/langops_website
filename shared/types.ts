import * as z from "zod"

// Sub-domain: Trello
export const TrelloDataSchema = z.object({
  id: z.string().nullable(),
  url: z.string().nullable(),
  title: z.string().nullable(),
  productCode: z.string().nullable(),
  targetLanguage: z.string().nullable(),
  dueDate: z.string().datetime().nullable(),
  datePublished: z.string().datetime().nullable(),
  dateLastActivity: z.string().datetime().nullable(),
  mediaGroups: z.array(z.string()),
  editorUrl: z.string().nullable(),
  articleUrl: z.string().nullable(),
  wordCount: z.number().int().nullable(),
});

// Sub-domain: YouTube
export const YouTubeDataSchema = z.object({
  id: z.string().nullable(),
  localizedTitle: z.string().nullable(),
  url: z.string().nullable(),
  durationSeconds: z.number().int().nullable(),
});

// Sub-domain: Crowdin
export const CrowdinDataSchema = z.object({
  id: z.string().nullable(),
  translationProgress: z.number().nullable(),
  approvalProgress: z.number().nullable(),
  url: z.string().nullable(),
});

// The Clean API Object (Domain Model)
export const LangOpsProductSchema = z.object({
  id: z.string().uuid(),
  dateCreated: z.string().datetime(),
  dateDeleted: z.string().datetime().nullable(),
  trello: TrelloDataSchema,
  youtube: YouTubeDataSchema,
  crowdin: CrowdinDataSchema,
});

// Extract the TypeScript types from the schemas
export type LangOpsProduct = z.infer<typeof LangOpsProductSchema>;



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





export type CrowdinProject = {
    id: number
    name: string
    targetLanguages: { id: string; name: string }[]
}

