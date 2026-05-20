import type { ApiFilters, ArchivedProduct, IdmlStorageRecord, CrowdinProject } from "../../shared/types"

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

export async function queryAllCompletions(filters: ApiFilters) {
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

export async function globalSearchQuery(filters: ApiFilters) {
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

    const url = `/api/all${query ? `?${query}` : ''}`

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch global search data.")
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
        const response = await fetch(`/api/completions/delete/${id}`, {
        method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete completion')
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
    const response = await fetch(`/api/resync/${id}/${mode}`, {
        method: 'PUT'
    })
    if (!response.ok) throw new Error('Failed to restore completion')
    return response.json()
}

/** Send an IDML, receive xliff_out.zip (keep this for /reconstruct later) */
export async function parseIdml(idmlFile: File, sourceLang = 'fr'): Promise<Blob> {
    const form = new FormData();
    form.append('idml', idmlFile);
    form.append('source_lang', sourceLang);

    const res = await fetch(`/api/idml/parse`, { method: 'POST', body: form });
    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
    }
    return res.blob(); // store this ZIP — it contains style_map.json needed for reconstruct
}

/** Send original IDML + the ZIP from parseIdml(), receive rebuilt.idml */
export async function reconstructIdml(idmlFile: File, xliffsZip: File | Blob): Promise<Blob> {
    const form = new FormData();
    form.append('idml', idmlFile);
    form.append('xliffs', xliffsZip, 'xliff_out.zip');

    const res = await fetch(`/api/idml/reconstruct`, { method: 'POST', body: form });
    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
    }
    return res.blob();
}

export async function uploadXliffToCrowdin(
    fileName: string,
    content: Blob,
    projectId: string
): Promise<{ crowdinFileId: number }> {
    const form = new FormData();
    form.append('xliff', content, fileName);
    form.append('fileName', fileName);
    form.append('projectId', projectId);

    const res = await fetch('/api/crowdin/upload', { method: 'POST', body: form });
    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error);
    }
    return res.json();
}

export async function fetchCrowdinProjects(): Promise<CrowdinProject[]> {
    const res = await fetch('/api/crowdin/projects')
    if (!res.ok) throw new Error('Failed to fetch Crowdin projects')
    return res.json()
}

export async function listIdmlStorage(): Promise<IdmlStorageRecord[]> {
    const res = await fetch('/api/idml/storage')
    if (!res.ok) throw new Error('Failed to fetch IDML storage records')
    return res.json()
}

export async function saveIdmlStorage(
    idmlFile: File,
    xliffZip: Blob,
    projectId: string,
    projectName: string,
    targetLanguage: string,
    crowdinFileIds: number[]
): Promise<{ id: number }> {
    const form = new FormData()
    form.append('idml', idmlFile, idmlFile.name)
    form.append('xliffZip', xliffZip, 'xliff_out.zip')
    form.append('fileName', idmlFile.name)
    form.append('projectId', projectId)
    form.append('projectName', projectName)
    form.append('targetLanguage', targetLanguage)
    form.append('crowdinFileIds', JSON.stringify(crowdinFileIds))

    const res = await fetch('/api/idml/storage', { method: 'POST', body: form })
    if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
    }
    return res.json()
}

export async function deleteIdmlStorage(id: number): Promise<void> {
    const res = await fetch(`/api/idml/storage/${id}`, { method: 'DELETE' })
    if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
    }
}

export async function triggerReconstruct(id: number): Promise<void> {
    const res = await fetch(`/api/idml/storage/${id}/reconstruct`, { method: 'POST' })
    if (!res.ok) {
        const { error } = await res.json()
        throw new Error(error)
    }
}