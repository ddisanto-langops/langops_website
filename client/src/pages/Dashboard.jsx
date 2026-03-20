import { NavBar } from '../components/NavBar'
import { useState } from 'react'
import { TotalWords } from '../components/totalWords'
import { DashboardFilters } from '../components/dashboardFilters'

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
      <h1 id="dashboard-page-title">Dashboard</h1>
      <div id='dashboard-container'>
        <div id='dashboard-filter-container'>
          <DashboardFilters filters={filters} onFilterChange={setFilters} />
        </div>
        <div id='total-words-container'>
          <TotalWords filters={filters}/>
        </div>
      </div>
    </div>
  )
}
