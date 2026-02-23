import { useState, useEffect } from "react";

const fakeData = [
  { title: "RV202503_ES", targetLang: 'es', productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
  { title: "RV202503_ES", targetLang: 'es', productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
  { title: "RV202503_ES", targetLang: "es", productStatus: 'Completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 50, approvalProg: 10 },
]

export function Table() {
    const [rows, setRows] = useState([])
    useEffect(() => {
    setRows(fakeData)
  }, [])

  return (
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
        {rows.map(row => (
          <tr key={row.id}>
            <td>{row.title}</td>
            <td>{row.targetLang}</td>
            <td>{row.productStatus}</td>
            <td>{row.due}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

}