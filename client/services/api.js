export async function fetchProducts() {
    const response = await fetch("/api/data")
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}

export async function fetchCompletions(filters) {
    const params = new URLSearchParams()

    if (filters.lang) params.append('lang', filters.lang)
    if (filters.code) params.append('code', filters.code)
    if (filters.group) params.append('group', filters.group)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)

    const query = params.toString()
    const url = query ? `/api/completions?${query}` : '/api/completions'

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return response.json()
}

export async function fetchAdminCompletions(filters = {}) {
    const params = new URLSearchParams()

    if (filters.lang) params.append('lang', filters.lang)
    if (filters.code) params.append('code', filters.code)
    if (filters.group) params.append('group', filters.group)
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)
    
    const query = params.toString()
    const url = `/api/admin/completions${query ? `?${query}` : ''}`

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return response.json()
}

export async function updateCompletion(record) {
    const response = await fetch(`/api/admin/completions/${record.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
    })
    console.log(JSON.stringify(response))
    if (!response.ok) throw new Error('Failed to update completion')
    return response.json()
}

export async function deleteCompletion(id) {
    const response = await fetch(`/api/admin/completions/${id}`, {
        method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete completion')
    return response.json()
}