export async function fetchProducts() {
    const response = await fetch("http://localhost:3200/api/data")
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
}