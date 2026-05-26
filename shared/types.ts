export interface BaseProduct {
    id: string
    title: string
    productCode: string
    targetLanguage: string
    datePublished: string | null
    mediaGroups: string[]
    labels?: [{ id: string; name: string; }]
    published: boolean
    crowdinProjectId: string | null
    crowdinFileId: string | null
    exclude: boolean
    wordCount: number
    trelloUrl: string
}


export interface ActiveProduct {
    /*
     * Defined as a card on the LangOps Trello Board
     * whose title contains a valid product code, 
     * target language, and is not archived, 
     * though it may be published.
    */
    id: string
    title: string
    productCode: string
    targetLanguage: string
    productStatus: string
    mediaGroups: string[]
    excluded: boolean
    dateLastActivity: string
    dueDate: string | null
    datePublished: string | null
    trelloUrl: string,
    editorUrl: string | null
    crowdinUrl: string | null
    articleUrl: string | null
    translationProgress: number | null
    approvalProgress: number | null
    wordCount: number | null
}

export interface ArchivedProduct {
    /*
    * Defined as a closed (archived) card on the LangOps Trello board
    * which has also been published. If not published, it is not
    * considered archived.
    */
    id: string
    title: string
    localizedTitle: string | null
    productCode: string
    targetLanguage: string
    mediaGroups: string[]
    datePublished: string | null
    dateArchived: string
    trelloUrl: string
    editorUrl: string | null
    articleUrl: string | null
    wordCount: number | null
}

export interface ApiFilters {
    lang?: string | undefined
    code?: string | undefined
    group?: string | undefined
    from?: string | undefined
    to?: string | undefined
    title?: string | undefined
    source?: string | undefined
    page?: number | undefined
    limit?: number | undefined
    pageSize?: number | undefined
    sortBy?: string | undefined
    sortDir?: string | undefined
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

export interface XliffEntry {
    originalName: string   // the filename as it came out of the ZIP
    displayName: string    // what the user has typed in the rename box
    content: Blob          // the raw file bytes, ready to POST
    summary?: string       // first few source segments, shown as a tooltip
}

export interface IdmlStorageRecord {
    id: number
    fileName: string
    crowdinProjectId: string | null
    crowdinProjectName: string | null
    targetLanguage: string | null
    crowdinFileIds: number[]
    status: 'pending' | 'complete'
    createdAt: string
    updatedAt: string
}

export type CrowdinProject = {
    id: number
    name: string
    targetLanguages: { id: string; name: string }[]
}

export interface AllProduct {
    source: 'active' | 'archived' | 'deleted'
    id: string
    title: string
    productCode: string
    targetLanguage: string
    mediaGroups: string[]
    wordCount: number | null
    datePublished: string | null
    trelloUrl: string
    editorUrl: string | null
    articleUrl: string | null
    // active-only
    productStatus: string | null
    dueDate: string | null
    dateLastActivity: string | null
    translationProgress: number | null
    approvalProgress: number | null
    crowdinUrl: string | null
    // archived-only
    localizedTitle: string | null
    dateArchived: string | null
}