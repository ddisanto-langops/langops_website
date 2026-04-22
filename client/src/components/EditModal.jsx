import { useState, useEffect } from "react"
import { friendlyFieldNames, friendlyLanguages } from "../../../server/services/constants.mjs"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompletion, deleteCompletion } from '../../services/api'
import { mediaGroups, groupDisplayNames } from "../../../server/services/constants.mjs"

export function EditModal({record, isOpen, onClose}) {
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState(record)

    useEffect(() => {
        setFormData(record)
    }, [record])

    const saveMutation = useMutation({
        mutationFn: updateCompletion,
        onSuccess: () => {
            queryClient.invalidateQueries(['completions'])
            onClose()
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteCompletion(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['completions'])
            onClose()
        }
    })

    if (!isOpen) return null

    const allMediaTypes = Object.keys(mediaGroups)
    const editableFields = ['title', 'productCode', 'targetLang', 'wordCount', 'datePublished', 'dateArchived']

    return (
        <div className="modal-overlay">
            <div className="modal-content">
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
                        Click to view on Trello
                    </a>
                </p>
                : null
                }
                {formData.editorUrl ? 
                <p
                    className="trello-link-completions"
                    style={{justifySelf: 'center'}}
                >
                    <a
                        id="completions-link"
                        style={{color: 'coral'}} 
                        href={formData.editorUrl} target="_blank"
                    >
                        Click to Edit in Refinery
                    </a>
                </p>
                : null
                }
                {formData.articleUrl ? 
                <p
                    className="trello-link-completions"
                    style={{justifySelf: 'center'}}
                >
                    <a
                        id="completions-link"
                        style={{color: 'coral'}} 
                        href={formData.articleUrl} target="_blank"
                    >
                        Click to view article
                    </a>
                </p>
                : null
                }
                <div className="modal-body">
                    {Object.entries(formData)
                        .filter(([key]) => editableFields.includes(key))
                        .map(([key, value]) => (
                            <div key={key} className="modal-field">
                                <label key={key} className="modal-label">{friendlyFieldNames[key] || key}:</label>
                                {key === 'targetLang' ? 
                                    <select
                                        className="modal-input"
                                        value={value}
                                        onChange={e => setFormData({...formData, [key]: e.target.value})}
                                    >
                                        {friendlyLanguages.map(lang => 
                                            <option>{lang}</option>
                                        )}
                                    </select>
                                    : 
                                    <input
                                        className="modal-input"
                                        value={value || ''}
                                        onChange={e => setFormData({...formData, [key]: e.target.value})}
                                        readOnly={key === 'productCode'}
                                    />
                                }
                                
                            </div>
                    ))}
                    <div className="modal-field">
                        <label className="modal-label">Media Type:</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {allMediaTypes.map(type => {
                                const isSelected = formData.mediaType?.includes(type) ?? false
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.mediaType ?? []
                                            const updated = isSelected
                                                ? current.filter(t => t !== type)
                                                : [...current, type]
                                            setFormData({...formData, mediaType: updated})
                                        }}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '999px',
                                            border: '1px solid coral',
                                            background: isSelected ? 'coral' : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        {groupDisplayNames[type]}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    
                    <button 
                        id="btn-save" 
                        onClick={() => {
                            saveMutation.mutate(formData); 
                            onClose()
                            }
                        }>
                        {saveMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        id="btn-delete"
                        onClick={() => deleteMutation.mutate(record.id)}>
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                    <button id="btn-close" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}
