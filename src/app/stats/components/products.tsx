import { apiRequest } from "@/app/lib/langops-api";
import { buildQuery } from "@/app/lib/functions";
import styles from "@/app/stats/stats.module.css"
import { toArray } from "@/app/lib/functions"

interface ProductRepsonse {
    totalProducts: number
    data: [
        {
            productCode: string
            count: number
        }
    ]
}

interface ProductsProps {
    params: Promise<{ [key: string]: string | string[] | undefined }>
}


export async function Products({params}: ProductsProps) {
    const searchParams = await params
    
    const filters = {
        targetLanguages: toArray(searchParams.targetLanguages),
        productCodes: toArray(searchParams.productCodes),
        mediaGroups: toArray(searchParams.mediaGroups),
        dateFrom: searchParams.dateFrom,
        dateTo: searchParams.dateTo
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