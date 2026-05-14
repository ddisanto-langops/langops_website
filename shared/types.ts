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
    published: boolean
    excluded: boolean
    dateLastActivity: string
    dueDate: string | null
    datePublished: string | null
    trelloUrl: string,
    editorUrl: string | null
    crowdinUrl: string | null
    articleUrl: string | null
    translationProgress: number
    approvalProgress: number
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

export interface CardCustomFieldWebResponse {
    value: {checked: boolean}
    idCustomField: string
}

export interface CardRefreshWebResponse {
    id: string
    name: string
    dateLastActivity: string
    due: string
    url: string
    actions: [
        {
            data: {
                checkItem?: {
                    id: string
                    name: string
                    state: string
                }
                customFieldItem?: [
                    value: {
                        checked: boolean
                    },
                    idCustomField: string
                ]
            }
        }
    ]
    
}