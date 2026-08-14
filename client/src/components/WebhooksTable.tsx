import "./styles/webhook-table.css"
import { useEffect, useState } from "react"
import { getFailedWebhooks } from "../../services/api"
import { WebhookFailure } from "@langops-website/shared"

export function WebhooksTable() {
    const [webhooks, setWebhooks] = useState<WebhookFailure[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchWebhooks = async () => {
        try {
            setLoading(true)
            const data = await getFailedWebhooks()
            setWebhooks(data)
        } catch (error) {
            error instanceof Error? setError(error.message) : setError("Unknown error")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWebhooks()
    }, [])
    
    return (
        <>
        <p className="generic-notice">Below are products that failed to be automatically created, edited or deleted. 
            <br/>Some common reasons for this include:
            <ul>
                <li>Title is missing product code</li>
                <li>Title is missing target language</li>
                <li>Title is URL</li>
                <li>Product not found</li>
                <li>Unexpected server error</li>
            </ul>
            <strong>Some of these may be false alarms,</strong> but they are preserved here for verification. 
            Once you have manually processed or verified the product, click on "delete" to remove the entry from this table.
        </p>
        {   error ? <p className="error-message">Error fetching webhooks</p> :
        
            loading ? <p className="generic-notice">Loading...</p> :
        
            webhooks.length > 0 ?
                <div id="webhook-table-div">
                    <table id="webhook-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status Code</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                webhooks.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.data.action?.data.card.name}</td>
                                        <td>{item.statusCode}</td>
                                        <td><button>Delete</button></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                :
                <p className="generic-notice">No failed webhooks found.</p>
        }
        </>
    )
                
            
        
}