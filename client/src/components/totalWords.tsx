import type { ProductMetaFilters } from "@langops-website/shared"
import { useQuery } from "@tanstack/react-query"
import { getWordCount } from "../../services/api"

interface TotalWordsProps {
  filters: ProductMetaFilters
}

export function TotalWords({filters}: TotalWordsProps) {

    const { data, isLoading } = useQuery({
    queryKey: ['completions', filters],
    queryFn: () => getWordCount(filters)
  })

  if (isLoading) return <p>Loading...</p>

  const formattedNumber = new Intl.NumberFormat('en-US').format(data.totalWords)
  return <p id="total-words">{formattedNumber} words</p>
}