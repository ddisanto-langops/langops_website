import type { ActiveProduct } from '../../../shared/types';
import { formatDate } from '../../services/formatDate'

interface TableDetailProps {
  row: ActiveProduct | undefined
}

export function TableDetail( {row}: TableDetailProps) {

    if (!row) return <div className="placeholder">Select a row to see details.</div>;

     return (
    <div>
      <h2>{row.title}</h2>
      <p>Language: {row.targetLanguage}</p>
      <p>Status: {row.productStatus || '❓'}</p>
      <p>Due: {formatDate(row.dueDate) || '❓'}</p>
      <p>Last Activity: {formatDate(row.dateLastActivity) || '❓'}</p>
      <p>Translation Progress: {row.translationProgress ? `${row.translationProgress}%` : '❓'}</p>
      <p>Approval Progress: {row.approvalProgress ? `${row.approvalProgress}%` : '❓'}</p>
      <p>Published: {row.published ? '✅': '❌'} </p>
      <p><a className="detail-link" href={row.crowdinUrl ?? ''} target="_blank" rel="noopener">{row.crowdinUrl ? 'Crowdin Link': ''}</a></p>
      <p><a className="detail-link" href={row.trelloUrl} target="_blank" rel="noopener">{row.trelloUrl ? 'Trello Link': ''}</a></p>
    </div>
  )
}