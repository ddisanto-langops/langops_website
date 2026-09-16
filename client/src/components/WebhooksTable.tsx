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
        <div className="generic-notice"><span style={{color:"coral"}}>Below are products that failed to be automatically created, edited or deleted. Please process each item on Trello, verify it appears on this website, and then delete the record below.</span> 
        <p style={{justifySelf: 'left'}}>Common reasons for cards to appear here:</p>
            <ul>
                <li>Invalid title (missing product code, etc.)</li>
                <li>Attempting to edit a non-existent card</li>
                <li>Unhandled server error</li>
            </ul>
        <p style={{justifySelf: 'left'}}><strong>Note: manual card creation tends to generate false positives due to placeholder titles applied by Trello.</strong></p>
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