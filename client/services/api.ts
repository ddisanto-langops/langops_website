import { ResponseList, ProjectsGroupsModel } from '@crowdin/crowdin-api-client';
import type { 
    GetProductFilters, 
    LangOpsProduct, 
    PaginatedProductResponse, 
    ProductCountResponse, 
    ProductMetaFilters, 
    StringMapResponse
} from "@shared/types"


function buildQuery(filters: object): string {
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
    return params.toString().replace(/\+/g, '%20')
}


export async function getCrowdinProjects()  {
    const response = await fetch('/api/crowdin/projects')
    if (!response.ok) throw new Error('Failed to get Crowdin projects')
    
    return response.json()
}

export async function getCrowdinFiles(projectId: number | null)  {
    const response = await fetch(`/api/crowdin/files/${projectId}`)
    if (!response.ok) throw new Error('Failed to get Crowdin projects')
    
    return response.json()
}


export async function getProducts(filters: GetProductFilters): Promise<PaginatedProductResponse> {
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

export async function getStringMap(projectId: number | string, fileId: number | string): Promise<StringMapResponse> {
    const response = await fetch(`/api/idml/map/${projectId}/${fileId}`)

    if (!response.ok) throw new Error("Failed to get string map")
    
    const stringMap: StringMapResponse = await response.json()
    return stringMap
}


export async function editProduct(id: string, record: LangOpsProduct) {
    const headers = new Headers()
    headers.append("Content-Type", "application/json")
    const response = await fetch(`/api/products/edit/${id}`, {
        headers: headers,
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