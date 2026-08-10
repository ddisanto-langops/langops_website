import "./styles/sidebar.css"
import { Link } from 'react-router-dom'

interface SidebarProps {
    isOpen: boolean
}

export function Sidebar({ isOpen } : SidebarProps) {
    if (!isOpen) return null
    return (
        <div className="sidebar-background">
            <div className='homepage-links-div'>
                <Link style={{textDecoration: 'none'}} to={"/dashboard"} className='homepage-link'><span>📊</span> Translation Stats</Link>
                <Link style={{textDecoration: 'none'}} to={"/products"} className='homepage-link'><span>🔍</span> Active & Completed Products</Link>
                <Link style={{textDecoration: 'none', width: "100%"}} to={"/manage-idmls"} className='homepage-link'><span>🔖</span> Label IDMLs</Link>
                <a 
                    href='https://api.pcglangops.com/redoc'
                    className='homepage-link'
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{textDecoration: 'none'}}
                >
                    <span>📖</span> View API Documentation
                </a>
            </div>
        </div>
    )
}