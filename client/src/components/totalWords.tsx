import type { ApiFilters } from "../../../shared/types"

import { useQuery } from "@tanstack/react-query"
import { fetchFilteredCompletions } from "../../services/api"

interface TotalWordsProps {
  filters: ApiFilters
}
export function TotalWords({filters}: TotalWordsProps) {

    const { data, isLoading } = useQuery({
    queryKey: ['completions', filters],
    queryFn: () => fetchFilteredCompletions(filters)
  })

  if (isLoading) return <p>Loading...</p>
  return <p id="total-words">{data?.totalWords.toLocaleString() ?? 0} words</p>
}