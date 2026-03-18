import { useState, useEffect } from "react"
import { friendlyFieldNames } from "../../../server/services/constants.mjs"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompletion, deleteCompletion } from '../../services/api'

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

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="modal-title">Edit Record</h2>
                
                <div className="modal-body">
                    {Object.entries(formData).map(([key, value]) => (
                        <div key={key} className="modal-field">
                            <label className="modal-label">
                                {friendlyFieldNames[key] || key}:
                            </label>
                            <input 
                                className="modal-input"
                                value={value || ''}
                                onChange={e => setFormData({...formData, [key]: e.target.value})}
                                readOnly={key === 'id'}
                            />
                        </div>
                    ))}
                </div>
                
                <div className="modal-actions">
                    
                    <button 
                        id="btn-save" 
                        onClick={() => saveMutation.mutate(formData)}>
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
