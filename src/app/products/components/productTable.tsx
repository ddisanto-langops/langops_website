import { PaginatedProductResponse } from "@/app/lib/types";
import { apiRequest } from "@/app/lib/langops-api";
import styles from "@/app/products/products.module.css"

export async function ProductTable() {
    const products: PaginatedProductResponse = await apiRequest("products", { method: 'GET' })

    return (
        <div className={styles.tableDiv}>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Target Language</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        products.total > 0 ?
                        products.data.map((product) => {
                            return (
                                <tr>
                                    <td>{product.trelloData.title}</td>
                                    <td>{product.trelloData.targetLanguage}</td>
                                    <td>{product.trelloData.targetLanguage}</td>
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