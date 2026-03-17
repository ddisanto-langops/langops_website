import { useState } from 'react'
import { CompletionsTable } from '../components/completionsTable'
import { Link } from 'react-router-dom'

export function CompletionsPage() {

  const [selectedRow, setSelectedRow] = useState(null)

  return (
  <div id='main-container'>
    <div className='page-head-container'>
      <div className='navbar-container'>
        <nav>
          <Link to={'/'} className='navbar-link'>Back To Dashboard View</Link>
        </nav>
      </div>
    </div>
    <div className='table-layout-container'>
      <div className='table-container'>
        <CompletionsTable onRowClick={setSelectedRow} />
      </div>
    </div>
  </div>
  )
}