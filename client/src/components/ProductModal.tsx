import "./styles/product-modal.css"
import { LangOpsProduct } from "@langops-website/shared"
import { DeletePermanentlyButton } from "./DeletePermanentlyButton"
import { formatDate } from "../../services/formatDate"
import { useState, useEffect } from "react"
import ISO6391 from "iso-639-1"

interface ProductModalProps {
    record: LangOpsProduct,
    isOpen: boolean,
    onClose: () => void
}

export function ProductModal({record, isOpen, onClose}: ProductModalProps) {
    const [formData, setFormData] = useState(record)

    useEffect(() => {
        setFormData(record)
    }, [record])

    
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return "Pending ⌛";
            case 'published':
                return "Published ✅";
            case 'unknown':
                return "❓";
            case 'deleted':
                return "Deleted ⛔";
            case 'archived':
                return "Archived 📚";
            default:
                return "";
        }
    }


    if (!isOpen) return null
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">View Record</h2>
                {
                    formData.productStatus !== "deleted" ?
                    <p className="generic-notice">Product data is refreshed in near-real time. This product has status "{formData.productStatus}" and cannot be edited here. If you need to make edits, <a
                        style={{color: 'coral'}} 
                        href={formData.trelloData.url ? formData.trelloData.url : "https://trello.com"} 
                        target="_blank"
                        rel="noopener"
                    >
                        please do so in Trello
                    </a>.</p>
                    :
                    <>
                        <p className="generic-notice">This product has been deleted from Trello. If you want to purge it from the database, do so via the button below.</p>
                        <DeletePermanentlyButton id={formData.trelloData.id} onDelete={onClose} />
                    </>
                }
                
                {formData.crowdinData?.crowdinUrl ? 
                <p className="generic-notice">This product is being localized<span> </span>
                    <a
                        style={{color: 'coral'}} 
                        href={formData.crowdinData.crowdinUrl} 
                        target="_blank"
                        rel="noopener"
                    >
                        in Crowdin
                    </a>
                </p>
                : null
                }
                <div className="modal-body">
                    <div className="modal-field">
                        <label className="modal-label">Title:</label>
                        <input className="modal-input" disabled={true} value={formData.trelloData.title ?? '❓'}/>
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Target Language:</label>
                        <input className="modal-input" disabled={true} value={formData.trelloData.targetLanguage ? ISO6391.getName(formData.trelloData.targetLanguage) : ''}/>
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Status:</label>
                        <input className="modal-input" disabled={true} value={getStatusLabel(formData.productStatus)}/> 
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Due:</label>
                        <input className="modal-input" disabled={true} value={formatDate(formData.trelloData.dueDate) ?? '❓'}/>
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Last Activity:</label>
                        <input className="modal-input" disabled={true} value={formatDate(formData.trelloData.dateLastActivity)}/>
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Wordcount:</label>
                        <input className="modal-input" disabled={true} value={String(formData.trelloData.wordCount)} />
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Translation Progress:</label>
                        {formData.crowdinData?.translationProgress ? `${formData.crowdinData.translationProgress}%` : '❓'}
                    </div>
                    <div className="modal-field">
                        <label className="modal-label">Approval Progress:</label>
                        {formData.crowdinData?.approvalProgress ? `${formData.crowdinData.approvalProgress}%` : '❓'}
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
            </div>
        </div>
    )
}