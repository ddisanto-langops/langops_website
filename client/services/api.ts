import type { GetProductFilters, PaginatedProductResponse, ProductCountResponse } from "../types/types"





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
