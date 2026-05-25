import { Link } from 'react-router-dom'

export function NavBar() {
    return (
        <div id='navbar-div'>
            <div className='website-title-div'>
                <Link id='website-title' to={"/"}><h1>PCG LangOps</h1></Link>
            </div>
            <nav id='navbar'>
                <Link to={"/dashboard"} className='navbar-link'>Dashboard</Link>
                <Link to={"/products"} className='navbar-link'>Products</Link>
                <Link to={"/manage-idmls"} className='navbar-link'>Manage IDMLs</Link>
            </nav>
        </div>
    )
}