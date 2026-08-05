import { NavBar } from '../components/NavBar'
import { useState } from 'react'
import { TotalWords } from '../components/totalWords'
import { DashboardFilter } from '../components/dashboardFilters'
import { ProductCount } from '../components/productCount'
import { ProductMetaFilters } from '@shared/types'

export function Dashboard() {

  const today = new Date().toISOString().split("T")[0]
  const yearPattern = /^[0-9]{4}/
  const yearMatch = today.match(yearPattern)

  const [ filters, setFilters ] = useState<ProductMetaFilters>({
    targetLanguages: undefined,
    productCodes: undefined,
    mediaGroups: undefined,
    dateFrom: yearMatch ? `${yearMatch[0]}-01-01` : undefined,
    dateTo: today
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
