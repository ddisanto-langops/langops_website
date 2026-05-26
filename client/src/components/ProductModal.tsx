import type { ActiveProduct, ArchivedProduct } from "../../../shared/types"
import { formatDate } from "../../services/formatDate"
import { useState, useEffect } from "react"
import { resync } from "../../services/api"
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface ProductModalProps {
    record: ActiveProduct,
    isOpen: boolean,
    onClose: () => void
}

export function ProductModal({record, isOpen, onClose}: ProductModalProps) {
    
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState(record)

    useEffect(() => {
        setFormData(record)
    }, [record])

    const resyncMutation = useMutation({
        mutationFn: (id: string) => resync(id, "active"),
        onSuccess: (result: ActiveProduct[]) => {
            queryClient.invalidateQueries({queryKey: ['products']})
            if (result[0]) setFormData(result[0])
        }
    })

    if (!isOpen) return null
    return (
        <div className="modal-overlay">
            <form 
                name="editModal"
                className="modal-content"
            >
                <h2 className="modal-title">View Record</h2>
                <p className="generic-notice">Product data is automatically refreshed every 5 minutes. If you need to edit a product, please do so in Trello, then click "Re-Sync Data" to immediately refresh this display.</p>
                {formData.trelloUrl ? 
                <p
                    style={{justifySelf: 'center'}}
                >
                    <a
                        style={{color: 'coral'}} 
                        href={formData.trelloUrl} 
                        target="_blank"
                        rel="noopener"
                    >
                        View in Trello
                    </a>
                </p>
                : null
                }
                {formData.crowdinUrl ? 
                <p
                    style={{justifySelf: 'center'}}
                >
                    <a
                        style={{color: 'coral'}} 
                        href={formData.crowdinUrl} 
                        target="_blank"
                        rel="noopener"
                    >
                        Edit in Crowdin
                    </a>
                </p>
                : null
                }
                <div className="modal-resync-div">
                    <button
                        type="button"
                        className="resync-button"
                        onClick={() => resyncMutation.mutate(String(formData.id))}
                    >
                        {resyncMutation.isPending ? "Loading..." : "Re-Sync Data"}
                    </button>
                </div>
                <div className="modal-body">
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Title:</label>
                        <p className="product-modal-info">{formData.title ?? '❓'}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Target Language:</label>
                        <p className="product-modal-info">{formData.targetLanguage}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Status:</label>
                        <p className="product-modal-info">
                            {formData.productStatus === 'pending' ? "Pending ⌛" : ""}
                            {formData.productStatus === 'published' ? 'Published ✅': ""}
                            {formData.productStatus === 'unknown' ? '❓' : ""}
                        </p>        
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Due:</label>
                        <p className="product-modal-info">{formatDate(formData.dueDate) ?? '❓'}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Last Activity:</label>
                        <p className="product-modal-info">{formatDate(formData.dateLastActivity)}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Translation Progress:</label>
                        <p className="product-modal-info">
                            {formData.translationProgress ? `${formData.approvalProgress}%` : '⛔'}
                        </p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Approval Progress:</label>
                        <p className="product-modal-info">
                            {formData.approvalProgress ? `${formData.approvalProgress}%` : '⛔'}
                        </p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Date Published:</label>
                        <p className="product-modal-info">{formatDate(formData.datePublished) ?? '❓'}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Wordcount:</label>
                        <p className="product-modal-info">{formData.wordCount}</p>
                    </div>
                </div>
                <div className="modal-actions">
                    <button 
                        type="button"
                        id="btn-close" 
                        onClick={onClose}
                    >Close
                    </button>
                </div>
            </form>
        </div>
    )
}