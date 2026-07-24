import { NavBar } from '../components/NavBar'
import { useState } from 'react'
import { TotalWords } from '../components/totalWords'
import { DashboardFilter } from '../components/dashboardFilters'
import { ProductCount } from '../components/productCount'
import { ProductMetaFilters } from '@langops/shared/types'

export function Dashboard() {

  const [ filters, setFilters ] = useState<ProductMetaFilters>({
    targetLanguage: undefined,
    productCode: undefined,
    mediaGroups: undefined,
    dateFrom: undefined,
    dateTo: undefined
  })

  return (
    <div className="homepage-container">
      <div className='navbar-container'>
        <NavBar />
      </div>
      <h2 id="dashboard-page-title">Dashboard</h2>
      <div id='dashboard-container'>
        <div id='dashboard-filter-container'>
          <DashboardFilter filters={filters} onFilterChange={setFilters} />
        </div>
        <div id='total-words-container'>
          <TotalWords filters={filters}/>
        </div>
        <div>
          <ProductCount filters={filters} />
        </div>
      </div>
    </div>
  )
}
