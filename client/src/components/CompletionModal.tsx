import type { ArchivedProduct } from "../../../shared/types"

import { EditableLink} from "./EditableLink"
import React, { useState, useEffect } from "react"
import { supportedLanguages, groupDisplayNames, productCodes } from "../../../shared/constants"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompletion, deleteCompletion, resync } from '../../services/api'

interface CompletionModalProps {
    record: ArchivedProduct,
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
        mutationFn: updateCompletion,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['completions']})
            onClose()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCompletion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['completions']})
            onClose()
        }
    })

    const resyncMutation = useMutation({
        mutationFn: (id: string) => resync(id, "archived"),
        onSuccess: (result: ArchivedProduct[]) => {
            queryClient.invalidateQueries({queryKey: ['completions']})
            if (result[0]) setFormData(result[0])
        }
    })

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
                {formData.trelloUrl ? 
                <p
                    className="trello-link-completions"
                    style={{justifySelf: 'center'}}
                >
                    <a
                        id="completions-link"
                        style={{color: 'coral'}} 
                        href={formData.trelloUrl} target="_blank"
                    >
                        View on Trello
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
                    <div className="completion-modal-field">
                        <label className="completion-modal-label">Editor URL:</label>
                        <EditableLink accessor="editorUrl" currentLink={formData.editorUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="completion-modal-label">Article URL:</label>
                        <EditableLink accessor="articleUrl" currentLink={formData.articleUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="completion-modal-label">Title:</label>
                        <input
                            name="title" 
                            className="completion-modal-input" 
                            value={formData.title}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Localized Title:</label>
                        <input
                            name="localizedTitle" 
                            className="completion-modal-input" 
                            value={formData.localizedTitle ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Product Code:</label>
                        <select
                            name="productCode" 
                            className="completion-modal-input" 
                            value={formData.productCode}
                            onChange={handleDropdownChange}
                        >
                            {productCodes.map(code => (
                                <option key={code}>{code}</option>
                            ))}
                        </select>
                        <label className="completion-modal-label">Target Language:</label>
                        <select
                            name="targetLanguage" 
                            className="completion-modal-input" 
                            value={formData.targetLanguage}
                            onChange={handleDropdownChange}
                        >
                            {supportedLanguages.map(language => (
                                <option key={language}>{language}</option>
                            ))}
                        </select>
                        <label className="completion-modal-label">Date Published:</label>
                        <input
                            name="datePublished"
                            className="completion-modal-input" 
                            value={formData.datePublished ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Date Archived:</label>
                        <input
                            name="dateArchived"
                            className="completion-modal-input" 
                            value={formData.dateArchived ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="completion-modal-label">Wordcount:</label>
                        <input
                            name="wordCount"
                            className="completion-modal-input" 
                            value={formData.wordCount ?? ''}
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