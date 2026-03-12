import { Link } from 'react-router-dom'

export default function Dashboard() {
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
          <p>Filter</p>
        </div>
        <div id='total-words-container'>
          <p>Total Words</p>
        </div>
      </div>
    </div>
  )
}