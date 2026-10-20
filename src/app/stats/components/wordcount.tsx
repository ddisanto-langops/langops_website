import styles from "@/app/stats/stats.module.css"
import { buildQuery } from "@/app/lib/functions"
import { apiRequest } from "@/app/lib/langops-api"
import { toArray } from "@/app/lib/functions"

interface WordcountProps {
  params: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function DisplayWordCount({ params }: WordcountProps) {
  const searchParams = await params

  // Same defaults the Filter shows on first load

  const filters = {
    targetLanguages: toArray(searchParams.targetLanguages),
    productCodes: toArray(searchParams.productCodes),
    mediaGroups: toArray(searchParams.mediaGroups),
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo
  }

  const qs = buildQuery(filters)
  const endpoint = `products/wordcount?${qs}`

  try {
    const wordcount = await apiRequest(endpoint, { method: "GET" })
    return (
      <div className={styles.wordcount}>
        <span style={{ color: "white" }}>Words Published:</span>{" "}
        {wordcount.totalWords.toLocaleString()}
      </div>
    )
  } catch {
    return (
      <div className={styles.wordcount}>
        <span style={{ color: "white" }}>Words Published: 0</span>
      </div>
    )
  }
}