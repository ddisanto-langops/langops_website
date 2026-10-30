import { PaginatedProductResponse } from "@/app/lib/types"
import styles from "@/app/products/products.module.css"
import ISO6391 from 'iso-639-1'

interface TableProps {
    products: PaginatedProductResponse
}

export async function ProductTable({ products }: TableProps) {

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