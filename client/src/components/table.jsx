import { useState, useEffect } from "react";
import { SearchBox } from "./searchbox";

const fakeData = [
  { id: 1, title: "RV202503_ES", targetLang: 'es', productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
  { id:2, title: "RV202503_ES", targetLang: 'es', productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
  { id: 3, title: "RV202503_ES", targetLang: "es", productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
]

export function Table() {
    const [rows, setRows] = useState([])
    const [category, setCategory] = useState('title')
    const [query, setQuery] = useState('')
    
    useEffect(() => {
    setRows(fakeData)
  }, [])


    const filteredRows = rows.filter((row) => {
        const value = row[category]?.toString().toLowerCase() || "";
        return value.includes(query.toLowerCase());
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
            <th>Title</th>
            <th>Target Language</th>
            <th>Status</th>
            <th>Due</th>
            </tr>
        </thead>
        <tbody>
            {filteredRows.map(row => (
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