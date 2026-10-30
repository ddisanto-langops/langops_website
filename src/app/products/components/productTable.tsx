import { GetProductFilters, PaginatedProductResponse } from "@/app/lib/types";
import { apiRequest } from "@/app/lib/langops-api";
import styles from "@/app/products/products.module.css"
import { UrlSearchProps } from "@/app/lib/types";
import { toArray } from "@/app/lib/functions"
import { buildQuery } from "@/app/lib/functions";
import ISO6391 from 'iso-639-1'

export async function ProductTable({ searchParams }: UrlSearchProps) {
    const params = await searchParams
    const filters: GetProductFilters = {
            targetLanguages: toArray(params.targetLanguages),
            productCodes: toArray(params.productCodes),
            mediaGroups: toArray(params.mediaGroups),
            status: toArray(params.status),
            search: params.search,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo
    }
    const query = buildQuery(filters)
    const endpoint = `products?${query}`
    const products: PaginatedProductResponse = await apiRequest(endpoint, { method: 'GET' })

    return (
        <div className={styles.tableDiv}>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Target Language</th>
                        <th>Status</th>
                        <th>Due</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        products.total > 0 ?
                        products.data.map((product) => {
                            return (
                                <tr key={product.id}>
                                    <td>{product.trelloData.title}</td>
                                    <td>{product.trelloData.targetLanguage ? ISO6391.getName(product.trelloData.targetLanguage) : null}</td>
                                    <td>{product.productStatus}</td>
                                    <td>{product.trelloData.dueDate}</td>
                                </tr>
                                
                            )
                        }) 
                        : null
                    }
                </tbody>
            </table>

        </div>
    )
}