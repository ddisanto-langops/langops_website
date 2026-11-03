import { PaginatedProductResponse } from "@/app/lib/types"
import styles from "@/app/products/products.module.css"
import ISO6391 from 'iso-639-1'

interface TableProps {
    products: PaginatedProductResponse
}

export async function ProductTable({ products }: TableProps) {

    return (
        <div className={styles.tableDiv}>
            <table className={styles.productsTable}>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Target Language</th>
                        <th>Status</th>
                        <th>Due</th>
                    </tr>
                </thead>
                <tbody className={styles.tableBody}>
                    {
                        products.total > 0 ?
                        products.data.map((product) => {
                            return (
                                <tr 
                                    className={styles.tableRow} 
                                    key={product.id}
                                >
                                    <td className={styles.tableCell}>{product.trelloData.title}</td>
                                    <td className={styles.tableCell}>{product.trelloData.targetLanguage ? ISO6391.getName(product.trelloData.targetLanguage) : null}</td>
                                    <td className={styles.tableCell}>{product.productStatus}</td>
                                    <td className={styles.tableCell}>{product.trelloData.dueDate}</td>
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