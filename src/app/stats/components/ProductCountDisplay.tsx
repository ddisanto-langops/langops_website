import { ProductCountResponse } from "@/app/lib/types"
import styles from "@/app/stats/stats.module.css"

interface ProductCountDisplayProps {
    productCount: ProductCountResponse
}


export function ProductCountDisplay({ productCount }: ProductCountDisplayProps) {

    return (
        <div className={styles.productDiv}>
            {
            productCount.data ?
            productCount.data.map((product) => {
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