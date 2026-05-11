import type { ApiFilters } from "../../../shared/types"
import { useQuery } from "@tanstack/react-query"
import { fetchCompletionsByProduct } from "../../services/api"

interface ProductCountProps {
	filters: ApiFilters
}

export function ProductCount({filters}: ProductCountProps) {

	const { data, isLoading, isError, error } = useQuery({
	queryKey: ['byproduct', filters],
	queryFn: () => fetchCompletionsByProduct(filters)
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error: {error.message}</p>;

  if (!data) return (<p>NO DATA</p>);

   if (!Array.isArray(data)) {
	return <p>Data is not in the expected format.</p>;
  }

  return (
	<>
  	<div className="product-count-container">
		{data
			.sort((key, value) => key.product_code.localeCompare(value.product_code))
			.map((item) => (
				<div className="product-count-data">{`${item.product_code}: ${item.occurence_count}`}</div>
			))
		}
	</div>
  	</>
	)

}