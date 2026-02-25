import { useState, useEffect } from "react";
import { SearchBox } from "./searchbox";

const fakeData = [
  { id: 1, title: "RV202503_ES", targetLang: 'es', productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
  { id:2, title: "PT202603_FR", targetLang: 'fr', productStatus: 'incomplete', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
  { id: 3, title: "TB_SomeTitle_IT", targetLang: "it", productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
]

export function Table() {
    const [rows, setRows] = useState([])
    const [category, setCategory] = useState('title')
    const [query, setQuery] = useState('')
    const [sortKey, setSortKey] = useState(null)
    const [sortDirection, setSortDirection] = useState('asc')
    
    useEffect(() => {
    setRows(fakeData)
  }, [])


    const filteredRows = rows.filter((row) => {
        const value = row[category]?.toString().toLowerCase() ?? "";
        return value.includes(query.toLowerCase());
    })

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDirection('asc')
        }
    }

    function SortIndicator({sortKey, column, sortDirection}) {
        if (sortKey != column) return null
        return <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
    }

    const sortedRows = [...filteredRows].sort((a, b) => {
        if (sortKey === null) return 0  // no sort applied yet
        const aVal = a[sortKey]?.toString().toLowerCase() ?? ""
        const bVal = b[sortKey]?.toString().toLowerCase() ?? ""
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
        })

  return (
    <div>
        <SearchBox 
            category={category}
            setCategory={setCategory}
            query={query}
            setQuery={setQuery}
        />
        <table>
        <thead>
            <tr>
            <th onClick={() => {handleSort('title')}}>Title <SortIndicator sortKey={sortKey} column="title" sortDirection={sortDirection} /></th>
            <th onClick={() => {handleSort('targetLang')}}>Target Language <SortIndicator sortKey={sortKey} column="targetLang" sortDirection={sortDirection} /></th>
            <th onClick={() => {handleSort('productStatus')}}>Status <SortIndicator sortKey={sortKey} column="productStatus" sortDirection={sortDirection} /></th>
            <th onClick={() => {handleSort('due')}}>Due <SortIndicator sortKey={sortKey} column="due" sortDirection={sortDirection} /></th>
            </tr>
        </thead>
        <tbody>
            {sortedRows.map(row => (
            <tr key={row.id}>
                <td>{row.title}</td>
                <td>{row.targetLang}</td>
                <td>{row.productStatus}</td>
                <td>{row.due}</td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  )

}