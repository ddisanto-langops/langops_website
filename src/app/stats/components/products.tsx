import { apiRequest } from "@/app/lib/langops-api";
import styles from "@/app/stats/stats.module.css"

interface ProductRepsonse {
    totalProducts: number
    data: [
        {
            productCode: string
            count: number
        }
    ]
}

export async function Products() {
    const options: RequestInit = {
        method: 'GET'
    }
    const products: ProductRepsonse = await apiRequest("products/productcount", options)

    return (
        <div className={styles.productDiv}>
            {products.data.map((product) => {
                return (
                    <div className={styles.productCount} key={product.productCode}>
                        <span>{product.productCode}: {product.count}</span>
                    </div>
                )
            }).sort()}
        </div>
    )
}