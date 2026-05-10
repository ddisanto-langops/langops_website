import type { ArchivedProduct } from '../../../shared/types'

import { useState } from 'react'
import { CompletionTable } from '../components/completionTable'
import { NavBar } from '../components/NavBar' 
import { EditModal } from '../components/EditModal'

export function CompletionsPage() {

  const [selectedRecord, setSelectedRecord] = useState<ArchivedProduct>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRowClick = (row: ArchivedProduct) => {
    setSelectedRecord(row),
    setIsModalOpen(true)
  }

  return (
  <div id='main-container'>
    <div className='page-head-container'>
      <div className='navbar-container'>
        <NavBar />
      </div>
    </div>
    <div className='completions-table-layout-container'>
      <div id='completions-table-container'>
        <CompletionTable onRowClick={handleRowClick} />
      </div>
    </div>
    {selectedRecord && (
      <EditModal record={selectedRecord} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    )}
    
  </div>
  )
}