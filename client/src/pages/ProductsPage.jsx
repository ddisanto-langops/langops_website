import { useState } from 'react'
import { ProductsTable } from '../components/productsTable'
import { TableDetail } from '../components/tableDetail'
import { Link } from 'react-router-dom'

export function ProductsPage() {

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
        <ProductsTable onRowClick={setSelectedRow} />
      </div>
      <div className='table-detail-container'>
        <TableDetail row={selectedRow} />
      </div>
    </div>
  </div>
  )
}