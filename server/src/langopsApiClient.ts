import { GetProductFilters,
    PaginatedProductResponse,
    ProductCountResponse,
    ProductMetaFilters,
    LangOpsProduct,
    WordCountResponse,
    DeleteResponse,
    RestoreResponse,
    StringMapResponse,
    StringMapItem,
    WebhookFailure,
    LangOpsApiError
} from "@langops-website/shared"

export class LangOpsApiClient {

    readonly basePath: string
    private readonly cfAccessClientId: string
    private readonly cfAccessClientSecret: string
    private readonly headers: Headers

    constructor() {
        this.cfAccessClientId = process.env.CF_ACCESS_CLIENT_ID ?? ""
        this.cfAccessClientSecret = process.env.CF_ACCESS_CLIENT_SECRET ?? ""
        this.basePath = "https://api.pcglangops.com/api/v1"

        if (
            !this.cfAccessClientId ||
            !this.cfAccessClientSecret
        ) {
            throw new Error("Unable to init LangOps API client: missing one or more env variables")
        }

        this.headers = new Headers()
        this.headers.append("Content-Type", "application/json")
        this.headers.append("CF-Access-Client-Id", this.cfAccessClientId)
        this.headers.append("CF-Access-Client-Secret", this.cfAccessClientSecret)
    }


    private buildParams(filters: object): URLSearchParams {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null || value === '') {
            continue
        } else {
            if (Array.isArray(value)) {
                value.forEach(item => params.append(key, String(item)))
            } else {
                params.append(key, String(value))
            }
        }
    }
    return params
}

    public async getProducts(filters: GetProductFilters): Promise<PaginatedProductResponse> {
                
        const response = await fetch(`${this.basePath}/products/?${this.buildParams(filters)}`,
            {
                method: 'GET',
                headers: this.headers
            }
        )
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return response.json()
    }

    public async getProductCount(filters: ProductMetaFilters): Promise<ProductCountResponse> {
        const url = `${this.basePath}/products/productcount?${this.buildParams(filters)}`
        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }


    public async getWordCount(filters: ProductMetaFilters): Promise<WordCountResponse> {
        const url = `${this.basePath}/products/wordcount?${this.buildParams(filters)}`
        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }

    
    public async getFailedWebhooks(): Promise<Response> {
        const url = `${this.basePath}/webhooks/failures`
        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        })
        
        return await response.json()
    }


    public async getStringMap(projectId: number, fileId: number): Promise<StringMapResponse | LangOpsApiError> {
        const url = `${this.basePath}/idml/map/${projectId}/${fileId}`
        const response = await fetch(url,
            {
                method: 'GET',
                headers: this.headers
            }
        )
       if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }


    public async labelIdml(crowdinProjectId: number, stringMapitems: StringMapItem[]) {
        const url = `${this.basePath}/idml/label/${crowdinProjectId}`
        const response = await fetch(url, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(stringMapitems)
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }
    

    public async editProduct(id: string, record: LangOpsProduct): Promise<LangOpsProduct | LangOpsApiError> {
        const url = `${this.basePath}/products/user-edit/${id}`
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(record)
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }


    public async restoreProduct(id: string): Promise<RestoreResponse | LangOpsApiError> {
        const response = await fetch(`${this.basePath}/products/restore/${id}`, {
            method: 'PATCH',
            headers: this.headers
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }


    public async softDeleteProduct(id: string): Promise<DeleteResponse | LangOpsApiError> {
        const response = await fetch(`${this.basePath}/products/delete/${id}`, {
            method: 'DELETE',
            headers: this.headers
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }


    public async permanentlyDeleteProduct(id: string): Promise<DeleteResponse | LangOpsApiError> {
        const response = await fetch(`${this.basePath}/products/permanent-delete/${id}`, {
            method: 'DELETE',
            headers: this.headers
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }
        
        return await response.json()
    }

    
    public async deleteFailedWebhook(id: string) {
        const response = await fetch(`${this.basePath}/webhooks/failures/delete/${id}`, {
            method: 'DELETE',
            headers: this.headers
        })
        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new LangOpsApiError(
                error.errorCode ?? response.status,
                error.message ?? response.statusText
            )
        }

        return await response.json()
    }
}
