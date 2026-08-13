import "./styles/sidebar.css"
import { Link } from 'react-router-dom'

interface SidebarProps {
    isOpen: boolean
    onClose: () => void
}

export function Sidebar({ isOpen, onClose } : SidebarProps) {
    if (!isOpen) return null
    return (
        <div className="sidebar-background">
            <div id="close-button-div">
                <button
                    className="interactive-button"
                    id="close-button"
                    onClick={onClose}
                >Close
                </button>
            </div>
            <div className='homepage-links-div'>
                <Link style={{textDecoration: 'none', width: "100%"}} to={"/dashboard"} className='homepage-link'><span>📊</span> Translation Stats</Link>
                <Link style={{textDecoration: 'none'}} to={"/products"} className='homepage-link'><span>🔍</span> Active & Completed Products</Link>
                <Link style={{textDecoration: 'none', width: "100%"}} to={"/manage-idmls"} className='homepage-link'><span>🔖</span> Label IDMLs</Link>
                <Link style={{textDecoration: 'none', width: "100%"}} to={"/webhooks"} className="homepage-link"><span>⚠️</span> Failures</Link>
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