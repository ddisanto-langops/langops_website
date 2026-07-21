import type { GetProductFilters, LangOpsProduct, PaginatedProductResponse, ProductCountResponse, ProductMetaFilters } from "../../shared/types"


function buildQuery(filters: GetProductFilters | ProductMetaFilters): URLSearchParams | null {
    if (!filters) return null
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(filters)) {
        if (key === "mediaGroups" && value != undefined) {
            for (const item of value) {
                query.append("mediaGroups", item)
                continue
            }
        } else {
            if (value != undefined) query.append(key.toString(), value)
        }
    }
    return query
}



export async function getProducts(filters: GetProductFilters) {
    const query = buildQuery(filters)
    if (query) {
        const response = await fetch(`/api/products?${query}`)
        if (!response.ok) throw new Error('Failed to get products')
        return response.json()
    } else {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Failed to get products')
        return response.json()
    }
}


export async function getWordCount(filters: ProductMetaFilters) {
    const query = buildQuery(filters)
    if (query) {
        const response = await fetch(`/api/products/wordcount?${query}`)
        if (!response.ok) throw new Error('Failed to get word count')
        return response.json()
    } else {
        const response = await fetch('/api/products/wordcount')
        if (!response.ok) throw new Error('Failed to get word count')
        return response.json()
    }
}


export async function getProductCount(filters: ProductMetaFilters): Promise<ProductCountResponse> {
    const query = buildQuery(filters)
    if (query) {
        const response = await fetch(`/api/products/productcount?${query}`)
        if (!response.ok) throw new Error('Failed to get product count')
        const productJson: ProductCountResponse = await response.json()
        return productJson
    } else {
        const response = await fetch('/api/products/productcount')
        if (!response.ok) throw new Error('Failed to get product count')
        const productJson: ProductCountResponse = await response.json()
        return productJson
    }
}


export async function editProduct(id: string, record: LangOpsProduct) {
    const response = await fetch(`/api/products/edit/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(record)
    })
    if (!response.ok) throw new Error('Failed to edit product')
    return response
}


export async function restoreProduct(id: string) {
    const response = await fetch(`/api/products/restore/${id}`, {
        method: 'PATCH'
    })
    if (!response.ok) throw new Error('Failed to restore product')
    return response
}

/**
 * Soft delete: moves a completions record to deletions database.
 * Corresponds to delete button on the Completion Modal.
 */
export async function deleteProduct(id: string) {
    if (confirm("Are you sure you want to delete this record?")) {
        const response = await fetch(`/api/products/delete/${id}`, {
        method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete completion')
        return response
    }
}

export async function permanentlyDeleteProduct(id: string) {
    if(confirm("Permanently delete this record? This action cannot be undone.")) {
        const response = await fetch(`/api/products/permanent-delete/${id}`, {
            method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete record')
        return response
    }
}









export async function fetchCrowdinProjects(): Promise<CrowdinProject[]> {
    const res = await fetch('/api/crowdin/projects')
    if (!res.ok) throw new Error('Failed to fetch Crowdin projects')
    return res.json()
}




