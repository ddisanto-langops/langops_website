export interface ActiveProduct {
    /*
    * Defined as a card on the LangOps Trello Board
    * whose title contains a valid product code, and
    * is not archived, though may be published.
    */
    id: string
    title: string
    productCode: string
    targetLang: string
    productStatus: string
    mediaType: string[]
    published: boolean
    datePublished: string | null
    dateLastActivity: string
    dueDate: string | null
    editorUrl: string | null
    crowdinUrl: string | null
    articleUrl: string | null
    translationProgress: number | null
    approvalProgress: number | null
    wordCount: number | null
}

export interface ArchivedProduct {
    /*
    * Defined as a closed card on the LangOps Trello board
    * which has been published. If not published, it is not
    * considered archivived.
    */
    id: number
    title: string
    productCode: string
    targetLang: string
    mediaType: string[]
    datePublished: string | null
    editorUrl: string | null
    crowdinUrl: string | null
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