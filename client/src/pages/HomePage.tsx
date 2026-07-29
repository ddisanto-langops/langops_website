import { Link } from 'react-router-dom'
import { NavBar } from '../components/NavBar'

export function HomePage() {
    return (
        <>
            <NavBar />
            <div className='homepage-title-div'>
                <p className='generic-notice'>
                    <h2>Welcome to the PCG LangOps website!</h2>
                    <strong>Language Managers & Admin Assistants</strong> 
                    <p>You can:</p>
                    <ul>
                        <li>View and sort translation stats</li>
                        <li>Track active/completed products</li>
                        <li>Edit completed products</li>
                        <li>Search the database</li>
                        <li>Label inDesign documents by article</li>
                    </ul>
                    
                    <strong>LangOps Director & Solutions Architects</strong> 
                    <p>Refer to the LangOps API documentation to plan:</p>
                    <ul>
                        <li>Blackbird integration with the LangOps Server</li>
                        <li>Crowdin integrations</li>
                        <li>Any other automations</li>
                    </ul>
                    <p>Note: Data on this site is refreshed via real-time webhooks.
                        <br/>In some cases, this may take a few moments to show up on the website.</p>
                </p>
            </div>
            <div className='homepage-links-div'>
                <Link style={{textDecoration: 'none'}} to={"/dashboard"} className='homepage-link'><span>📊</span> Translation Stats</Link>
                <Link style={{textDecoration: 'none'}} to={"/products"} className='homepage-link'><span>☑️</span> Active & Completed Products</Link>
                <Link style={{textDecoration: 'none'}} to={"/search"} className='homepage-link'><span>🔍</span> Search All Products</Link>
                <Link style={{textDecoration: 'none'}} to={"/manage-idmls"} className='homepage-link'><span>🔖</span> Label IDMLs</Link>
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
        </>
    )
}