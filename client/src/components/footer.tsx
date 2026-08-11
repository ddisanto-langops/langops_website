import "./styles/footer.css"
import { Link } from "react-router-dom"

export function Footer() {
    return (
        <div id='footer-navbar'>
            <a href="#navbar-div" className='navbar-link'>Back to Top</a>
            <Link to={"/"} className="navbar-link">Home</Link>
            <Link to={"/dashboard"} className='navbar-link'>Dashboard</Link>
            <Link to={"/products"} className='navbar-link'>Products</Link>
            <Link to={"/manage-idmls"} className='navbar-link'>Label IDMLs</Link>
        </div>
    )
}