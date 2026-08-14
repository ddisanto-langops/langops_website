import "./styles/permanently-delete-button.css"
import { permanentlyDeleteProduct } from "../../services/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

interface DeleteButtonProps {
    id: string
    onDelete: () => void
}

export function DeletePermanentlyButton({ id, onDelete} : DeleteButtonProps) {

    const queryClient = useQueryClient()
    const deleteMutation = useMutation({
            mutationFn: (id: string) => permanentlyDeleteProduct(id),
            onSuccess: () => {
                queryClient.invalidateQueries({queryKey: ['completions', 'products']})
                onDelete()
            }
        })

    const handleDelete = () => {
        if (window.confirm("Delete permanently? This cannot be undone.")) {
            deleteMutation.mutate(id)
        }
    }

    return (
        <div id="peramently-delete-button-div">
            <button 
                id="peramently-delete-button"
                type="button"
                onClick={handleDelete}
            >
                {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </button>
        </div>
    )
}