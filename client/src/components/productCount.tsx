import { useQuery } from "@tanstack/react-query"
import type { GetProductFilters } from "@langops-website/shared"
import { getProductCount } from "../../services/api"

interface ProductCountProps {
	filters: GetProductFilters
}


export function ProductCount({filters}: ProductCountProps) {
	const { data, isLoading, isError, error } = useQuery({
		queryKey: ['byproduct', filters],
		queryFn: () => getProductCount(filters)
  	})

  if (isLoading) return <p className="generic-notice">Loading products...</p>
  if (isError) return <p>Error: {error.message}</p>;

  if (!data) return (<p>NO DATA</p>);

  return (
	<>
  	<div className="product-count-container">
		{data.data
			
			.map((item) => (
				<div key={item.productCode} className="product-count-data">{`${item.productCode}: ${item.count}`}</div>
			))
		}
	</div>
  	</>
	)

}