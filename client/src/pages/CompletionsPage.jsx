import { useState } from 'react'
import { CompletionsTable } from '../components/completionsTable'
import { NavBar } from '../components/NavBar' 
import { EditModal } from '../components/EditModal'

export function CompletionsPage() {

  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleRowClick = (row) => {
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
    <div className='table-layout-container'>
      <div className='table-container'>
        <CompletionsTable onRowClick={handleRowClick} />
      </div>
    </div>
    {selectedRecord && (
      <EditModal record={selectedRecord} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    )}
    
  </div>
  )
}