import type { ActiveProduct } from '../../../shared/types';
import { formatDate } from '../../services/formatDate'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resync } from '../../services/api';
import { useState, useEffect } from "react";

interface TableDetailProps {
  row: ActiveProduct | undefined
}

export function TableDetail( {row}: TableDetailProps) {
  const [data, setData] = useState(row)

  useEffect(() => {
    setData(row)
  }, [row])

  const queryClient = useQueryClient()



  const resyncMutation = useMutation({
    mutationFn: (id: string) => resync(id, "active"),
    onSuccess: (result: ActiveProduct[]) => {
      queryClient.invalidateQueries({queryKey: ['products']})
      if (result[0]) setData(result[0])
    }
  })

  

    if (!data) return <div className="placeholder">Select a row to see details.</div>;

     return (
    <div>
      <h2>{data.title}</h2>
      <p>Language: {data.targetLanguage}</p>
      <p>Status: {data.productStatus || '❓'}</p>
      <p>Due: {formatDate(data.dueDate) || '❓'}</p>
      <p>Last Activity: {formatDate(data.dateLastActivity) || '❓'}</p>
      <p>Translation Progress: {data.translationProgress ? `${data.translationProgress}%` : '❓'}</p>
      <p>Approval Progress: {data.approvalProgress ? `${data.approvalProgress}%` : '❓'}</p>
      <p>Published: {data.published ? '✅': '❌'} </p>
      <p><a className="detail-link" href={data.crowdinUrl ?? ''} target="_blank" rel="noopener">{data.crowdinUrl ? 'Crowdin Link': ''}</a></p>
      <p><a className="detail-link" href={data.trelloUrl} target="_blank" rel="noopener">{data.trelloUrl ? 'Trello Link': ''}</a></p>
      <div>
        <button 
          className='resync-button'
          onClick={() => resyncMutation.mutate(String(data.id))}
          >
            {resyncMutation.isPending ? "Loading..." : "Re-Sync Data"}
          </button>
      </div>
    </div>
  )
}