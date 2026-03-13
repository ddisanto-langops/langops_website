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
      <a className="detail-link" href={row.crowdinUrl}>{row.crowdinUrl ? 'Crowdin Link': ''}</a>
      <a className="detail-link" href={row.trelloUrl}>{row.trelloUrl ? 'Trello Link': ''}</a>
    </div>
  )
}