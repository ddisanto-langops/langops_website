export function TableDetail({ row }) {

    if (!row) return <div className="placeholder">Select a row to see details.</div>;

     return (
    <div>
      <h2>{row.title}</h2>
      <p>Language: {row.targetLang}</p>
      <p>Status: {row.productStatus || '❓'}</p>
      <p>Due: {row.due || '❓'}</p>
      <p>Last Activity: {row.lastActivity || '❓'}</p>
      <p>Translation Progress: {row.translationProg ? `${row.translationProg}%` : '❓'}</p>
      <p>Approval Progress: {row.approvalProg ? `${row.approvalProg}%` : '❓'}</p>
      <p>Published: {row.published ? '✅': '❌'} </p>
      <a className="detail-link" href={row.crowdinUrl} target="_blank" rel="noopener">{row.crowdinUrl ? 'Crowdin Link': ''}</a>
      <br></br>
      <a className="detail-link" href={row.trelloUrl} target="_blank" rel="noopener">{row.trelloUrl ? 'Trello Link': ''}</a>
    </div>
  )
}