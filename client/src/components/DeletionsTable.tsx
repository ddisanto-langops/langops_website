import { useEffect, useState } from "react";
import { fetchDeletions, restoreCompletion, permanentlyDeleteCompletion } from "../../services/api";
import { formatDate } from "../../services/formatDate";
import type { ArchivedProduct } from "../../../shared/types";


export function DeletionsTable() {
    const [data, setData] = useState<ArchivedProduct[]>([])
    useEffect(() => {
        fetchDeletions()
            .then(setData)
    },[])

    const handleRestore = (id: string) => {
        restoreCompletion(id).then(() => {
            fetchDeletions().then(setData)
        })
    }

    const handleDelete = (id: string) => {
        permanentlyDeleteCompletion(id).then(() => {
            fetchDeletions().then(setData)
        })
    }

    if (!data || data.length === 0) return (
        <p className="generic-notice">No deletions to show</p>
    )
    return (
        <>
        <div id="deletions-table-div">
            <table id="deletions-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Target Language</th>
                        <th>Date Archived</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(item => (
                        <tr key={item.id}>
                            <td>{item.title}</td>
                            <td>{item.targetLanguage}</td>
                            <td>{formatDate(item.dateArchived)}</td>
                            <td>
                                <button
                                    id="restore-button"
                                    onClick={() => handleRestore(item.id)}
                                >
                                    Restore
                                </button>
                                <button
                                    id="permanent-delete"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        </>
    )
}