import type { ArchivedProduct } from "../../../shared/types"

import { EditableLink} from "./EditableLink"
import React, { useState, useEffect } from "react"
import { supportedLanguages, groupDisplayNames, productCodes } from "../../../shared/constants"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompletion, deleteCompletion } from '../../services/api'

interface EditModalProps {
    record: ArchivedProduct,
    isOpen: boolean,
    onClose: () => void
}

export function EditModal({record, isOpen, onClose}: EditModalProps) {
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
               
                <div className="modal-body">
                    <div className="modal-field">
                        <label className="modal-label">Editor URL:</label>
                        <EditableLink accessor="editorUrl" currentLink={formData.editorUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="modal-label">Article URL:</label>
                        <EditableLink accessor="articleUrl" currentLink={formData.articleUrl ?? ""} onChange={handleLinkEdit} />
                        <label className="modal-label">Title:</label>
                        <input
                            name="title" 
                            className="modal-input" 
                            value={formData.title}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Product Code:</label>
                        <select
                            name="productCode" 
                            className="modal-input" 
                            value={formData.productCode}
                            onChange={handleDropdownChange}
                        >
                            {productCodes.map(code => (
                                <option>{code}</option>
                            ))}
                        </select>
                        <label className="modal-label">Target Language:</label>
                        <select
                            name="targetLanguage" 
                            className="modal-input" 
                            value={formData.targetLanguage}
                            onChange={handleDropdownChange}
                        >
                            {supportedLanguages.map(language => (
                                <option>{language}</option>
                            ))}
                        </select>
                        <label className="modal-label">Date Published:</label>
                        <input
                            name="datePublished"
                            className="modal-input" 
                            value={formData.datePublished ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Date Archived:</label>
                        <input
                            name="dateArchived"
                            className="modal-input" 
                            value={formData.dateArchived ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        <label className="modal-label">Wordcount:</label>
                        <input
                            name="wordCount"
                            className="modal-input" 
                            value={formData.wordCount ?? ''}
                            onChange={handleInputChange}
                        >
                        </input>
                        
                    </div>
                    <div className="modal-mediagroups-div">
                            { 
                                Object.entries(groupDisplayNames).map(([key, value]) => {
                                    const selected = formData.mediaGroups.includes(key)
                                    return (
                                        <button
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