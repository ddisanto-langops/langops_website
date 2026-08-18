import "./styles/homepage.css"
import { NavBar } from '../components/NavBar'
import { Link } from "react-router-dom"

export function HomePage() {
   
    return (
        <div className='page-wrapper'>
            <NavBar />
            <div className='generic-notice' id='homepage-text' style={{paddingLeft: "25px", paddingRight: "25px"}}>
                <h2><span style={{color:"coral"}}>Welcome to the PCG LangOps website!</span></h2>
                <p style={{textAlign: "left"}}>
                    This website contains tools for <strong>Language Managers</strong>, <strong>Administrative Assistants</strong>, and <strong>Solutions Architects</strong>.
                </p>
                <p style={{textAlign: "left"}}>
                    It aims to support the localization process by making products easily discoverable in multiple languages,
                    and by providing a platform for future automations not possible elsewhere.
                </p>
                <p style={{textAlign: "left"}}>You can:</p>
                <ul>
                    <li>📊 View and filter <Link style={{color:"coral"}} to={"/dashboard"}>translations statistics</Link></li>
                    <li>🔍 <Link style={{color:"coral"}} to={"/products"}>Search for and edit products</Link> relevant to your language</li>
                    <li>🔖 <Link style={{color:"coral"}} to={"/manage-idmls"}>Label individual articles</Link> from inDesign documents uploaded to Crowdin</li>
                    <li>⚠️ <Link style={{color:"coral"}} to={"/webhooks"}>Process</Link> failed products manually</li>
                    <li>📖 Consult the PCG LangOps<span> </span>
                        <a 
                            href='https://api.pcglangops.com/redoc'
                            className='homepage-link'
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{color: 'coral'}}
                        >
                        API documentation
                        </a>  to plan automations
                    </li>
                </ul>
                <p style={{textAlign: "left"}}>Note: Data on this site is refreshed in near-real time.
                    <br/>In some cases, changes may take a few moments to show up on the website.</p>
            </div>
        </div>
    )
}