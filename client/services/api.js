export async function fetchProducts() {
    const response = await fetch("/api/data")
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}

export async function fetchCompletions(filters) {
    const params = new URLSearchParams()

    if (filters.lang) params.append('lang', filters.lang)
    if (filters.code) params.append('code', filters.code)
    if (filters.group) params.append('group', filters.group.join(',')) // This is an array, how to handle it and where?
    if (filters.from) params.append('from', filters.from)
    if (filters.to) params.append('to', filters.to)

    const query = params.toString()
    const url = query ? `/api/completions?${query}` : '/api/completions'

    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return response.json()
}
