import "./styles/delete-webhook-button.css"

interface DeleteButtonProps {
    handleDelete: () => void
}

export function DeleteWebhookButton({ handleDelete } : DeleteButtonProps) {
    return (
        <div id="delete-button-div">
            <button onClick={handleDelete}>
                Delete
            </button>
        </div>
    )
}