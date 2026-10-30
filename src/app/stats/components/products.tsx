import { apiRequest } from "@/app/lib/langops-api";
import { buildQuery } from "@/app/lib/functions";
import styles from "@/app/stats/stats.module.css"
import { toArray } from "@/app/lib/functions"
import { UrlSearchProps } from "@/app/lib/types";
import { GetProductFilters } from "@/app/lib/types";

interface ProductRepsonse {
    totalProducts: number
    data: [
        {
            productCode: string
            count: number
        }
    ]
}


export async function Products({ searchParams }: UrlSearchProps) {
    const params = await searchParams
    
    const filters: Partial<GetProductFilters> = {
        targetLanguages: toArray(params.targetLanguages),
        productCodes: toArray(params.productCodes),
        mediaGroups: toArray(params.mediaGroups),
        dateFrom: params.dateFrom,
        dateTo: params.dateTo
    }
    
    const qs = buildQuery(filters)
    const endpoint = `products/productcount?${qs}`
    const products: ProductRepsonse = await apiRequest(endpoint, {method: 'GET'})

    return (
        <div className={styles.productDiv}>
            {
            products.data ?
            products.data.map((product) => {
                return (
                    <div className={styles.productCount} key={product.productCode}>
                        <span>{product.productCode}: {product.count}</span>
                    </div>
                )
            }).sort()
            : null
            }
        </div>
    )
}