import { GetProductFilters,
    PaginatedProductResponse,
    ProductCountResponse,
    ProductMetaFilters,
    LangOpsProduct,
    WordCountResponse,
    DeleteResponse,
    RestoreResponse,
    EditProductRequest
} from "../../shared/types.js"

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

    public async getProducts(filters: GetProductFilters) {
                
        const response = await fetch(`${this.basePath}/products/?${this.buildParams(filters)}`,
            {
                method: 'GET',
                headers: this.headers
            }
        )
        if (!response.ok) throw new Error('Failed to fetch products')
        return response.json()
    
    }

    public async getProductCount(filters: ProductMetaFilters): Promise<ProductCountResponse> {
        const url = `${this.basePath}/products/productcount?${this.buildParams(filters)}`
        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        })
        if (!response.ok) throw new Error("Failed to fetch product count.")
        return await response.json()
    }


    public async getWordCount(filters: ProductMetaFilters): Promise<WordCountResponse> {
        const url = `${this.basePath}/products/wordcount?${this.buildParams(filters)}`
        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        })
        if (!response.ok) throw new Error("Failed to fetch wordcount.")
        return await response.json()
    }

    
    public async editProduct(id: string, record: LangOpsProduct): Promise<LangOpsProduct> {
        const url = `${this.basePath}/products/user-edit/${id}`
        const response = await fetch(url, {
            method: 'PATCH',
            headers: this.headers,
            body: JSON.stringify(record)
        })
        if (!response.ok) throw new Error('Failed to update completion')
        return await response.json()
    }


    public async restoreProduct(id: string): Promise<RestoreResponse> {
        const response = await fetch(`${this.basePath}/products/restore/${id}`, {
            method: 'PATCH',
            headers: this.headers
        })
        return await response.json()
    }


    public async softDeleteProduct(id: string): Promise<DeleteResponse> {
        const response = await fetch(`${this.basePath}/products/delete/${id}`, {
            method: 'DELETE',
            headers: this.headers
        })
        return await response.json()
    }


    public async permanentlyDeleteProduct(id: string): Promise<DeleteResponse> {
        const response = await fetch(`${this.basePath}/products/permanent-delete/${id}`, {
            method: 'DELETE',
            headers: this.headers
        })
        return await response.json()
    }

}
