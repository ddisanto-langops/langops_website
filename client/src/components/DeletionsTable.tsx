import React, { useEffect, useState } from "react";
import { fetchDeletions, restoreCompletion, permanentlyDeleteCompletion } from "../../services/api";
import { formatDate } from "../../services/formatDate";
import type { LangOpsProduct } from "../../types/types";


export function DeletionsTable() {
    const [data, setData] = useState<LangOpsProduct[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        fetchDeletions()
            .then(setData)
    },[])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const filteredData = data.filter((item) => item.trelloData.title.toLowerCase().includes(search.toLowerCase()))

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
        <div id="deletions-search">
            <input
                placeholder="Search deleted title..."
                value={search}
                onChange={(e) => handleSearch(e)}
            >
            </input>
        </div>
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
                    {filteredData.map(item => (
                        <tr key={item.id}>
                            <td>{item.trelloData.title}</td>
                            <td>{item.trelloData.targetLanguage}</td>
                            <td>{formatDate(item.trelloData.dateArchived)}</td>
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