import { LangOpsProduct } from "@langops-website/shared"
import { EditModal } from "./EditModal"
import { ProductModal } from "./ProductModal"

interface AdaptiveModalProps {
    row: LangOpsProduct | undefined
    isOpen: boolean
    handleModalClose: () => void
}


export function AdaptiveModal({ row, isOpen, handleModalClose }:AdaptiveModalProps) {
    
    if (!row) return null
    
    if (row.productStatus === "published") return ( <EditModal record={row} isOpen={isOpen} onClose={handleModalClose} />)
    
        return (
        <ProductModal record={row} isOpen={isOpen} onClose={handleModalClose} />
    )

}