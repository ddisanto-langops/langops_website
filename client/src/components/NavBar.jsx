import { Link } from 'react-router-dom'

export function NavBar() {
    return (
        <div id='navbar-div'>
            <div className='website-title-div'>
                <h1 id='website-title'>PCG LangOps</h1>
            </div>
            <nav id='navbar'>
                <Link to={"/"} className='navbar-link'>Dashboard</Link>
                <Link to={"/Products"} className='navbar-link'>Products</Link>
                <Link to={"/Completions"} className='navbar-link'>Completions</Link>
            </nav>
        </div>
    )
}