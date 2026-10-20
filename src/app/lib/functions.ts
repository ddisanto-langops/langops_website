export function buildQuery(filters: object): string {
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


export function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}