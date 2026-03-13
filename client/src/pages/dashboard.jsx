import { Link } from 'react-router-dom'
import { useState } from 'react'
import { TotalWords } from '../components/totalWords'
import { DropdownFilters } from '../components/dropdownFilters'

export default function Dashboard() {

  const [ filters, setFilters ] = useState({
    lang: null,
    code: null,
    group: null,
    to: null,
    from: null
  })

  return (
    <div className="homepage-container">
      <div className='navbar-container'>
        <nav>
          <Link to={'./table'} className='navbar-link'>Table View</Link>
        </nav>
      </div>
      <h1 id="dashboard-page-title">Dashboard</h1>
      <div id='dashboard-container'>
        <div id='dashboard-filter-container'>
          <DropdownFilters filters={filters} onFilterChange={setFilters} />
        </div>
        <div id='total-words-container'>
          <TotalWords filters={filters}/>
        </div>
      </div>
    </div>
  )
}