import { NavBar } from '../components/NavBar'
import { useState } from 'react'
import { TotalWords } from '../components/totalWords'
import { DashboardFilters } from '../components/dashboardFilters'
import { ProductCount } from '../components/productCount'

export function Dashboard() {

  const [ filters, setFilters ] = useState({
    lang: null,
    code: null,
    group: null,
    from: null,
    to: null,
  })

  return (
    <div className="homepage-container">
      <div className='navbar-container'>
        <NavBar />
      </div>
      <h2 id="dashboard-page-title">Dashboard</h2>
      <div id='dashboard-container'>
        <div id='dashboard-filter-container'>
          <DashboardFilters filters={filters} onFilterChange={setFilters} />
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
