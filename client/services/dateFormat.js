export function formatDate(isoString, timezone = 'America/Chicago') {
    if (!isoString) return '—'
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: timezone
    }).format(new Date(isoString.toLocaleString()))
}