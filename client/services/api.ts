import type { ApiFilters, ArchivedProduct } from "../../shared/types"

export async function fetchProducts() {
    const response = await fetch("/api/products")
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}

export async function fetchCompletions(filters: ApiFilters) {
    const params = new URLSearchParams()

    if (filters.lang) params.append('lang', filters.lang)
    if (filters.code) params.append('code', filters.code)
    if (filters.group) params.append('group', filters.group)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)

    const query = params.toString()
    const url = query ? `/api/completions/wordcount?${query}` : '/api/completions/wordcount'

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return response.json()
}

export async function fetchAdminCompletions(filters: ApiFilters) {
    const params = new URLSearchParams()

    if (filters.lang) params.append('lang', filters.lang)
    if (filters.code) params.append('code', filters.code)
    if (filters.group) params.append('group', filters.group)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)
    if (filters.title) params.append('title', filters.title)
    if (filters.page != null) params.append('page', String(filters.page))
    if (filters.pageSize != null) params.append('limit', String(filters.pageSize))
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortDir) params.append('sortDir', filters.sortDir)

    const query = params.toString()
    const url = `/api/completions${query ? `?${query}` : ''}`

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return await response.json()
}

export async function fetchCompletionsByProduct(filters: ApiFilters): Promise<{product_code: string, occurence_count: number}[]> {
    const params = new URLSearchParams()

    if (filters.lang) params.append('lang', filters.lang)
    if (filters.code) params.append('code', filters.code)
    if (filters.group) params.append('group', filters.group)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)
    
    const query = params.toString()
    const url = `/api/completions/byproduct${query ? `?${query}` : ''}`

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return await response.json()
}

export async function updateCompletion(record: ArchivedProduct) {
    const response = await fetch(`/api/completions/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
    })
    console.log(JSON.stringify(response))
    if (!response.ok) throw new Error('Failed to update completion')
    return response.json()
}

export async function deleteCompletion(id: string) {
    if (confirm("Are you sure you want to delete this record? This action cannot be undone.")) {
        const response = await fetch(`/api/admin/completions/${id}`, {
        method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete completion')
        return response.json()
    }
}