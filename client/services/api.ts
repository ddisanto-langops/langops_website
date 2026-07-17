import type { GetProductFilters, PaginatedProductResponse, ProductCountResponse } from "../types/types"

export class LangOpsApiClient {

    readonly basePath: string
    private readonly cfAccessClientId: string
    private readonly cfAccessClientSecret: string
    private readonly headers: Headers

    constructor() {
        this.cfAccessClientId = import.meta.env.CF_ACCESS_CLIENT_ID ?? ""
        this.cfAccessClientSecret = import.meta.env.CF_ACCESS_CLIENT_SECRET ?? ""
        this.basePath = "https://api.pcglangops.com/api/v1"

        if (
            !this.cfAccessClientId ||
            !this.cfAccessClientSecret ||
            !this.basePath
        ) {
            throw new Error("Unable to init LangOps API client: missing one or more env variables")
        }

        this.headers = new Headers()
        this.headers.append("Content-Type", "application/json")
        this.headers.append("CF-Access-Client-Id", this.cfAccessClientId)
        this.headers.append("CF-Access-Client-Secret", this.cfAccessClientSecret)
    }


    public async fetchProducts(filters: GetProductFilters): Promise<PaginatedProductResponse> {
        const params = new URLSearchParams
        filters.targetLanguage && params.append("targetLanguage", filters.targetLanguage)
        filters.dateFrom && params.append("dateFrom", filters.dateFrom.toString())
        filters.dateTo && params.append("dateTo", filters.dateTo.toString())
        filters.productCode && params.append("productCode", filters.productCode)
        filters.mediaGroups && filters.mediaGroups.forEach(group => {
            params.append("mediaGroups", group)
        })
        filters.search && params.append("search", filters.search)
        filters.limit && params.append("limit", filters.limit.toString())
        filters.offset && params.append("offset", filters.offset.toString())
        filters.archivedOnly && params.append("archivedOnly", filters.archivedOnly.toString())
        filters.publishedOnly && params.append("publishedOnly", filters.publishedOnly.toString())
        filters.unpublishedOnly && params.append("unpublishedOnly", filters.unpublishedOnly.toString())
        filters.excludeDeleted && params.append("excludeDeleted", filters.excludeDeleted.toString())

        const response = await fetch(`${this.basePath}/products/${params ? `?${params}` : ''}`,
            {
                method: 'GET',
                headers: this.headers
            }
        )
        if (!response.ok) throw new Error('Failed to fetch products')
        return response.json()
    }

    public async fetchProductCount(filters: GetProductFilters): Promise<ProductCountResponse> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
            if (value === undefined || value === null || value === '') continue
            if (Array.isArray(value)) {
                value.forEach(item => params.append(key, String(item)));
            } else {
                params.append(key, String(value))
            }
        }
        
        const query = params.toString()
        const url = `${this.basePath}/products/productcount/${query ? `?${query}` : ''}`

        const response = await fetch(url)
        if (!response.ok) throw new Error("Failed to fetch product count.")
        return await response.json()
    }

    public async editProduct(record: LangOpsProduct): Promise<void> {
        // NEED USER EDIT ENDPOINT
        const response = await fetch(`${this.basePath}/products/client-edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        })
        console.log(JSON.stringify(response))
        if (!response.ok) throw new Error('Failed to update completion')
        return response.json()
    }

}




/**
 * Soft delete: moves a completions record to deletions database.
 * Corresponds to delete button on the Completion Modal.
 */
export async function deleteCompletion(id: string) {
    if (confirm("Are you sure you want to delete this record?")) {
        const response = await fetch(`/api/completions/delete/${id}`, {
        method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete completion')
        return response.json()
    }
}

export async function permanentlyDeleteCompletion(id: string) {
    if(confirm("Permanently delete this record? This action cannot be undone.")) {
        const response = await fetch(`/api/deletions/delete/${id}`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete record')
        return response.json()
    }
}

export async function restoreCompletion(id: string) {
    const response = await fetch(`/api/completions/restore/${id}`, {
        method: 'PUT'
    })
    if (!response.ok) throw new Error('Failed to restore completion')
    return response.json()
}

export async function resync(id: string, mode: "active" | "archived") {
    const response = await fetch(`/api/resync/${mode}/${id}`, {
        method: 'PUT'
    })
    if (!response.ok) throw new Error('Failed to restore completion')
    return response.json()
}





export async function fetchCrowdinProjects(): Promise<CrowdinProject[]> {
    const res = await fetch('/api/crowdin/projects')
    if (!res.ok) throw new Error('Failed to fetch Crowdin projects')
    return res.json()
}



export async function fetchDeletions(): Promise<ArchivedProduct[]> {
    const res = await fetch('/api/deletions')
    if (!res.ok) throw new Error('Failed to fetch deletions')
    return res.json()
}
