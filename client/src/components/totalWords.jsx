import { useQuery } from "@tanstack/react-query"
import { fetchCompletions } from "../../services/api"

export function TotalWords({filters}) {

    const { data, isLoading } = useQuery({
    queryKey: ['completions', filters],
    queryFn: () => fetchCompletions(filters)
  })

  if (isLoading) return <p>Loading...</p>
  return <p id="total-words">{data?.totalWords ?? 0} words</p>
}