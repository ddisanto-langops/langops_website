import "./styles/webhook-table.css"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getFailedWebhooks, deleteFailedWebhook } from "../../services/api"
import { DeleteWebhookButton } from "./DeleteWebhookButton"

export function WebhooksTable() {

    const queryClient = useQueryClient()

    const { data: webhooks = [], isLoading, isError } = useQuery({
        queryKey: ["failedWebhooks"],
        queryFn: getFailedWebhooks
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteFailedWebhook(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["failedWebhooks"]})
        }
    })
    
    return (
        <>
        <div className="generic-notice"><span style={{color:"coral"}}>Below are products that failed to be automatically created, edited or deleted. You will need to process them on Trello.</span> 
            <br/>Some common reasons for this include:
            <ul>
                <li>Typo when creating card manually (e.g. missing product code/language)</li>
                <li>Title is URL</li>
                <li>Product not found</li>
                <li>Unexpected server error</li>
            </ul>
            <strong>Note: some of these may be false positives,</strong> but they are preserved for verification until deleted.
        </div>
        {   isError ? <p className="error-message">Error fetching webhooks</p> :
        
            isLoading ? <p className="generic-notice">Loading...</p> :
        
            webhooks.length > 0 ?
                <div id="webhook-table-div">
                    <table id="webhook-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                webhooks.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.data.action?.data.card.name}</td>
                                        <td>{item.statusCode}</td>
                                        <td><DeleteWebhookButton handleDelete={() => deleteMutation.mutate(item.id)} /></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                :
                <p className="generic-notice">No failed products found.</p>
        }
        </>
    )
                
            
        
}