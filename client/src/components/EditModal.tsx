import {
    LangOpsProduct,
    supportedLanguageEnum,
    groupDisplayNames,
    productCodeEnum
} from "@langops-website/shared"
import { editProduct, deleteProduct } from "../../services/api"
import { EditableLink} from "./EditableLink"
import React, { useState, useEffect } from "react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import ISO6391 from "iso-639-1"

interface CompletionModalProps {
    record: LangOpsProduct,
    isOpen: boolean,
    onClose: () => void
}

export function EditModal({record, isOpen, onClose}: CompletionModalProps) {
    
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState(record)

    useEffect(() => {
        setFormData(record)
    }, [record])

    const saveMutation = useMutation({
        mutationFn: (record: LangOpsProduct) => editProduct(record.trelloData.id, record),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products']})
            onClose()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['completions']})
            onClose()
        }
    })



    const handleLinkEdit = (accessor: string, newLink: string) => {
    setFormData((prev) => ({
        ...prev,
        trelloData: {
            ...prev.trelloData,
            [accessor]: newLink
        }
    }))
}

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
        ...prev,
        trelloData: {
            ...prev.trelloData,
            [name]: value
        }
    }))
}

const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
        ...prev,
        trelloData: {
            ...prev.trelloData,
            [name]: value
        }
    }))
}

    const handleMediaButtonClick = (key: string) => {
        const exists = formData.mediaGroups.includes(key)
        if (exists) {
            const newMediaGroups = formData.mediaGroups.filter(item => item !== key)
            setFormData((prev) => ({...prev, mediaGroups: newMediaGroups})) 
        }
        else {
            setFormData((prev) => ({...prev, mediaGroups: [...formData.mediaGroups, key]}))
        }

    }
    
    if (!isOpen) return null
    return (
        <div className="modal-overlay">
            <form 
                name="editModal"
                className="modal-content"
            >
                <h2 className="modal-title">Edit Record</h2>
                {formData.trelloData.url ? 
                <p
                    className="trello-link-completions"
                    style={{justifySelf: 'center'}}
                >
                    <a
                        id="completions-link"
                        style={{color: 'coral'}} 
                        href={formData.trelloData.url} target="_blank"
                    >
                        View on Trello
                    </a>
                </p>
                : null
                }
                <div className="modal-body">
                    <div className="modal-field">
                        <label className="modal-label">Editor URL:</label>
                        <EditableLink accessor="editorUrl" currentLink={formData.trelloData.editorUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="modal-label">Article URL:</label>
                        <EditableLink accessor="articleUrl" currentLink={formData.trelloData.articleUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="modal-label">YouTube URL:</label>
                        <EditableLink accessor="editorUrl" currentLink={formData.youtubeData?.url ?? ""} onChange={handleLinkEdit} />
                        <label className="modal-label">Title:</label>
                        <input
                            name="title" 
                            className="modal-input" 
                            value={formData.trelloData.title}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Localized Title:</label>
                        <input
                            name="localizedTitle" 
                            className="modal-input" 
                            value={formData.trelloData.localizedTitle ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Product Code:</label>
                        <select
                            name="productCode" 
                            className="modal-input" 
                            value={formData.trelloData.productCode ?? undefined}
                            onChange={handleDropdownChange}
                        >
                            {productCodeEnum.map(code => (
                                <option key={code}>{code}</option>
                            ))}
                        </select>
                        <label className="modal-label">Target Language:</label>
                        <select
                            name="targetLanguage" 
                            className="modal-input" 
                            value={formData.trelloData.targetLanguage ?? undefined}
                            onChange={handleDropdownChange}
                        >
                            {supportedLanguageEnum.map(language => (
                                <option key={language} value={ISO6391.getCode(language)}>{language}</option>
                            ))}
                        </select>
                        <label className="modal-label">Date Published:</label>
                        <input
                            name="datePublished"
                            className="modal-input" 
                            value={formData.trelloData.datePublished ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Date Archived:</label>
                        <input
                            name="dateArchived"
                            className="modal-input" 
                            value={formData.trelloData.dateArchived ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Wordcount:</label>
                        <input
                            name="wordCount"
                            className="modal-input" 
                            value={formData.trelloData.wordCount ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        
                    </div>
                    <div className="completion-modal-mediagroups-div">
                            { 
                                Object.entries(groupDisplayNames).map(([key, value]) => {
                                    const selected = formData.mediaGroups.includes(key)
                                    return (
                                        <button
                                            key={key}
                                            name="mediaGroups"
                                            type="button"
                                            className={selected ? "media-button active" : "media-button"}
                                            onClick={() => handleMediaButtonClick(key)}

                                     
                                        >
                                        {value}
                                        </button>
                                    )
                                    
                                    
                                })
                            }
                    </div>
                    <div className="modal-actions">
                        <button 
                            type="button"
                            id="btn-save" 
                            onClick={() => {
                                saveMutation.mutate(formData); 
                                }
                            }>
                            {saveMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                            type="button"
                            id="btn-delete"
                            onClick={() => deleteMutation.mutate(record.id)}
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                        <button 
                            type="button"
                            id="btn-close" 
                            onClick={onClose}
                        >Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}