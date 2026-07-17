import type { LangOpsProduct } from "../../types/types"

import { EditableLink} from "./EditableLink"
import React, { useState, useEffect } from "react"
import { supportedLanguageEnum, groupDisplayNames, productCodeEnum } from "../../types/enums"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LangOpsApiClient } from '../../services/api'

interface CompletionModalProps {
    record: LangOpsProduct,
    isOpen: boolean,
    onClose: () => void
}

const client = new LangOpsApiClient()

export function EditModal({record, isOpen, onClose}: CompletionModalProps) {
    
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState(record)

    useEffect(() => {
        setFormData(record)
    }, [record])

    const saveMutation = useMutation({
        mutationFn: client.editProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['completions']})
            onClose()
        }
    })

    /*
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCompletion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['completions']})
            onClose()
        }
    })
    */


    const handleLinkEdit = (accessor: string, newLink: string) => {
        setFormData((prev) => ({...prev, [accessor]: newLink}))

    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({...prev, [name]: value}))
    }

    const handleDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({...prev, [name]: value}))
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
                <div className="completion-modal-body">
                    <div className="completion-modal-field">
                        <label className="completion-modal-label">Editor URL:</label>
                        <EditableLink accessor="editorUrl" currentLink={formData.trelloData.editorUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="completion-modal-label">Article URL:</label>
                        <EditableLink accessor="articleUrl" currentLink={formData.trelloData.articleUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="completion-modal-label">Title:</label>
                        <input
                            name="title" 
                            className="completion-modal-input" 
                            value={formData.trelloData.title}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Localized Title:</label>
                        <input
                            name="localizedTitle" 
                            className="completion-modal-input" 
                            value={formData.trelloData.localizedTitle ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Product Code:</label>
                        <select
                            name="productCode" 
                            className="completion-modal-input" 
                            value={formData.trelloData.productCode ?? undefined}
                            onChange={handleDropdownChange}
                        >
                            {productCodeEnum.map(code => (
                                <option key={code}>{code}</option>
                            ))}
                        </select>
                        <label className="completion-modal-label">Target Language:</label>
                        <select
                            name="targetLanguage" 
                            className="completion-modal-input" 
                            value={formData.trelloData.targetLanguage ?? undefined}
                            onChange={handleDropdownChange}
                        >
                            {supportedLanguageEnum.map(language => (
                                <option key={language}>{language}</option>
                            ))}
                        </select>
                        <label className="completion-modal-label">Date Published:</label>
                        <input
                            name="datePublished"
                            className="completion-modal-input" 
                            value={formData.trelloData.datePublished ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Date Archived:</label>
                        <input
                            name="dateArchived"
                            className="completion-modal-input" 
                            value={formData.trelloData.dateArchived ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Wordcount:</label>
                        <input
                            name="wordCount"
                            className="completion-modal-input" 
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