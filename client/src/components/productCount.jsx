import { useQuery } from "@tanstack/react-query"
import { fetchCompletionsByProduct } from "../../services/api"

export function ProductCount({filters}) {
	console.log("ProductCount Rendering with filters:", filters)

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

  console.log("Type:", typeof data, "Is Array:", Array.isArray(data), "Value:", data);

  return (
	<>
  	<div className="product-count-container">
		{data
			.sort((key, value) => key.productcode.localeCompare(value.productcode))
			.map((item) => (
				<div className="product-count-data">{`${item.productcode}: ${item.occurence_count}`}</div>
			))
		}
	</div>
  	</>
	)

}