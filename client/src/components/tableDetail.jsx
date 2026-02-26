export function TableDetail({ row }) {
    if (!row) return <div className="placeholder">Select a row to see details.</div>;

     return (
    <div>
      <h2>{row.title}</h2>
      <p>Language: {row.targetLang}</p>
      <p>Status: {row.productStatus}</p>
      <p>Due: {row.due}</p>
      <p>Translation Progress: {row.translationProg}%</p>
      <p>Approval Progress: {row.approvalProg}%</p>
      <a href={row.crowdinUrl}>Crowdin Link</a>
    </div>
  )
}