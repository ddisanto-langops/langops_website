export interface ProductQuery {
    targetLanguages?: string[] | undefined
    dateFrom?: string | undefined
    dateTo?: string | undefined
    productCodes?: string[] | undefined
    mediaGroups?: string[] | undefined
    search?: string | undefined
    limit?: number | undefined
    offset?: number | undefined
    status?: string[] | undefined
}

export interface Wordcount {
    totalWords: string
}