import type { GetProductFilters } from "../../types/types"

import { useQuery } from "@tanstack/react-query"
import { LangOpsApiClient } from "../../services/api"

interface TotalWordsProps {
  filters: GetProductFilters
}

const client = new LangOpsApiClient

export function TotalWords({filters}: TotalWordsProps) {

    const { data, isLoading } = useQuery({
    queryKey: ['completions', filters],
    queryFn: () => client.fetchProducts(filters)
  })

  if (isLoading) return <p>Loading...</p>
  //return <p id="total-words">{data?.trello.toLocaleString() ?? 0} words</p>
}