export async function fetchProducts() {
    const response = await fetch("/api/data")
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}

export async function fetchCompletions(params) {
    const response = await fetch(`/api/completions/${params}`)
    if (!response.ok) throw new Error("Failed to fetch completions data.")
    return response.json()
}
