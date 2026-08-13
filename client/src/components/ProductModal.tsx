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


    if (!isOpen) return null
    return (
        <div className="modal-overlay">
            <div 
                className="modal-content"
            >
                <h2 className="modal-title">View Record</h2>
                {
                    formData.productStatus !== "deleted" ?
                    <p className="generic-notice">Product data is refreshed in near-real time. This product has status "{formData.productStatus}." If you need to update its status, <a
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
                <p
                    style={{justifySelf: 'center'}}
                >
                    <a
                        style={{color: 'coral'}} 
                        href={formData.crowdinData.crowdinUrl} 
                        target="_blank"
                        rel="noopener"
                    >
                        Edit in Crowdin
                    </a>
                </p>
                : null
                }
                <div className="modal-body">
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Title:</label>
                        <p className="product-modal-info">{formData.trelloData.title ?? '❓'}</p>
                    </div>
                    <div className="product-modal-info-block">
                        {
                            formData.trelloData.targetLanguage ?  
                                <>
                                    <label className="product-modal-label">Target Language:</label>
                                    <p className="product-modal-info">{ISO6391.getName(formData.trelloData.targetLanguage)}</p>
                                </>
                                : null
                        }
                        
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Status:</label>
                        <p className="product-modal-info">
                            {formData.productStatus === 'pending' ? "Pending ⌛" : ""}
                            {formData.productStatus === 'published' ? 'Published ✅': ""}
                            {formData.productStatus === 'unknown' ? '❓' : ""}
                            {formData.productStatus === 'deleted' ? "Deleted ⛔" : ""}
                            {formData.productStatus === "archived" ? "Archived 📚" : ""}
                        </p>        
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Due:</label>
                        <p className="product-modal-info">{formatDate(formData.trelloData.dueDate) ?? '❓'}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Last Activity:</label>
                        <p className="product-modal-info">{formatDate(formData.trelloData.dateLastActivity)}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Translation Progress:</label>
                        <p className="product-modal-info">
                            {formData.crowdinData?.translationProgress ? `${formData.crowdinData.translationProgress}%` : '⛔'}
                        </p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Approval Progress:</label>
                        <p className="product-modal-info">
                            {formData.crowdinData?.approvalProgress ? `${formData.crowdinData.approvalProgress}%` : '⛔'}
                        </p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Date Published:</label>
                        <p className="product-modal-info">{formatDate(formData.trelloData.datePublished) ?? '❓'}</p>
                    </div>
                    <div className="product-modal-info-block">
                        <label className="product-modal-label">Wordcount:</label>
                        <p className="product-modal-info">{formData.trelloData.wordCount}</p>
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