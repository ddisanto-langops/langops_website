export async function apiRequest(endpoint: string, options: RequestInit) {
    const basepath = process.env.BASEPATH
    if (!basepath) throw new Error("Unable to query LangOps API: no basepath defined")
    const res = await fetch(
        `${basepath}/${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                'CF-Access-Client-Id': `${process.env.CF_ACCESS_CLIENT_ID}`,
                'CF-Access-Client-Secret': `${process.env.CF_ACCESS_CLIENT_SECRET}`
            },
            ...options
        }
    )

    return res.json()
}

