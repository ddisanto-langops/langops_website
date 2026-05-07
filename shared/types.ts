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
    dateLastActivity: string
    trelloUrl: string,
    dueDate: string | null
    datePublished: string | null
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
    productCode: string
    targetLang: string
    mediaType: string[]
    datePublished: string | null
    dateArchived: string
    trelloUrl: string
    editorUrl: string | null
    articleUrl: string | null
    wordCount: number | null
}

export interface ApiResponse<T> {
    status: string
    data: T[]
    error?: {
        message: string
        code: string
    }
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
  due?: string
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