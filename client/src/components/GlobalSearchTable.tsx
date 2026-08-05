import { LangOpsProduct } from "@langops-website/shared";

interface GlobalSearchTableProps {
    data: LangOpsProduct[] | undefined
    handleRowClick: (product: LangOpsProduct) => void
}


export function GlobalSearchTable({ data, handleRowClick }:GlobalSearchTableProps) {
    if (data) {
        return (
            <div className="search-table">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                    </tr>
                </thead> 
                <tbody>
                    {
                        data.map((row) => (
                            <tr key={row.id} onClick={() => handleRowClick(row)}>
                                <td >{row.trelloData.title}</td>
                                <td>{row.productStatus}</td>
                            </tr>
                        )) 
                    }
                </tbody>
            </table> 
        </div>
        )
    } else {
        return (
            <p className="error-message">No products found</p>
        )
    }
}