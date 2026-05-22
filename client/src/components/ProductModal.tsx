import type { ActiveProduct, ArchivedProduct } from "../../../shared/types"

import React, { useState, useEffect } from "react"
import { supportedLanguages, groupDisplayNames, productCodes } from "../../../shared/constants"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompletion, deleteCompletion, resync } from '../../services/api'

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
                    <div className="product-modal-field">
                        <label className="product-modal-label">Title:</label>
                        <p className="product-modal-info">{formData.title ?? '❓'}</p>
                        <label className="product-modal-label">Target Language:</label>
                        <p className="product-modal-info">{formData.targetLanguage}</p>
                        <label className="product-modal-label">Status:</label>
                        <p className="product-modal-info">{formData.productStatus}</p>
                        <label className="product-modal-label">Due:</label>
                        <p className="product-modal-info">{formData.dueDate ?? '❓'}</p>
                        <label className="product-modal-label">Last Activity:</label>
                        <p className="product-modal-info">{formData.dateLastActivity}</p>
                        <label className="product-modal-label">Translation Progress:</label>
                        <p className="product-modal-info">{formData.translationProgress ?? '❓'}</p>
                        <label className="product-modal-label">Approval Progress:</label>
                        <p className="product-modal-info">{formData.approvalProgress ?? '❓'}</p>
                        <label className="product-modal-label">Published:</label>
                        <p className="product-modal-info">{formData.published ? '✅': '❌'}</p>
                        <label className="product-modal-label">Date Published:</label>
                        <p className="product-modal-info">{formData.datePublished ?? '❓'}</p>
                        <label className="product-modal-label">Wordcount:</label>
                        <p className="product-modal-info">{formData.wordCount}</p>
                    </div>
                    
                    <div className="modal-actions">
                        <button 
                            type="button"
                            id="btn-close" 
                            onClick={onClose}
                        >Close
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}