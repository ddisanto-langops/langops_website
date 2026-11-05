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

export function capitalize(str: string) {
    return str[0].toUpperCase() + str.slice(1);
}

export function dateTimeFormat(date: string) {
    if (!date) return ''

    const jsDate = new Date(date)
    return new Intl.DateTimeFormat('en-US', {timeZone: "America/Chicago", dateStyle: 'full', timeStyle: 'long'}).format(jsDate)
}