import { Link } from 'react-router-dom'

export function NavBar() {
    return (
        <div id='navbar-div'>
            <div className='website-title-div'>
                <h1 id='website-title'>PCG LangOps</h1>
            </div>
            <nav id='navbar'>
                <Link to={"/"} className='navbar-link'>Dashboard</Link>
                <Link to={"/products"} className='navbar-link'>Products</Link>
                <Link to={"/completions"} className='navbar-link'>Completions</Link>
                <Link to={"/manage-idmls"} className='navbar-link'>Manage IDMLs</Link>
            </nav>
        </div>
    )
}