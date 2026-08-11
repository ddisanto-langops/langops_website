import "./styles/homepage.css"
import { NavBar } from '../components/NavBar'
import { Sidebar } from '../components/sidebar'
import { useState } from 'react'

export function HomePage() {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const sidebarToggle = () => {
        setSidebarOpen(!sidebarOpen)
    }
    return (
        <div className='page-wrapper'>
            <NavBar />
            <Sidebar isOpen={sidebarOpen} onClose={sidebarToggle}/>
            <div className='generic-notice' id='homepage-text'>
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
                <p>Note: Data on this site is refreshed in near-real time.
                    <br/>In some cases, changes may take a few moments to show up on the website.</p>
            </div>
        </div>
    )
}