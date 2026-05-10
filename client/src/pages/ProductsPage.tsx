import type { ActiveProduct } from '../../../shared/types'

import { useState } from 'react'
import { ProductTable } from '../components/productTable'
import { TableDetail } from '../components/tableDetail'
import { NavBar } from '../components/NavBar'

export function ProductsPage() {

  const [selectedRow, setSelectedRow] = useState<ActiveProduct>()

  return (
  <div id='main-container'>
    <div className='page-head-container'>
      <div className='navbar-container'>
        <NavBar />
      </div>
    </div>
    <div className='table-layout-container'>
      <div className='table-container'>
        <ProductTable onRowClick={setSelectedRow} />
      </div>
      <div className='table-detail-container'>
        <TableDetail row={selectedRow} />
      </div>
    </div>
  </div>
  )
}