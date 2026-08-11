import  "./styles/navbar.css"
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './sidebar'

export function NavBar() {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    const sidebarToggle = () => {
        setSidebarOpen(!sidebarOpen)
    }
    return (
        <div id='navbar-div'>
            <div id="shortcuts-button-div">
                <button 
                    onClick={sidebarToggle}
                    className="interactive-button"
                    id="menu-button"
                
                >
                menu
                </button> 
            </div> 
            <Link id='website-title' to={"/"} style={{textDecoration: 'none'}}><h1>PCG LangOps</h1></Link>
            <Sidebar isOpen={sidebarOpen} onClose={sidebarToggle} />
            <div className="dummy-right"></div>
        </div>
    )
}