import { useState } from 'react'
import { Table } from '../components/table'
import { TableDetail } from '../components/tableDetail'

export function TableDisplay() {

  const [selectedRow, setSelectedRow] = useState(null)

  return (
  <div id='main-container'>
    <h1 id='products-page-title'>Products</h1>
    <div className='table-layout-container'>
      <div className='table-container'>
        <Table onRowClick={setSelectedRow} />
      </div>
      <div className='table-detail-container'>
        <TableDetail row={selectedRow} />
      </div>
    </div>
  </div>
  )
}