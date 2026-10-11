import '@/app/globals.css'
import styles from '@/app/page.module.css'
import { NavBar } from './ui/nav';
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <NavBar />
      <div className={styles.homepageBlurb}>
        <h2 className={styles.homepageTitle}>Welcome to the PCG LangOps Website!</h2>
        <p>This website contains tools for <strong>Language Managers</strong>, <strong>Administrative Assistants</strong>, and <strong>Solutions Architects</strong>.</p>
        <p>It aims to support localization by making it easier to find and track progress of products across languages. It also
          makes possible custom automations not possible elsewhere.</p>
          <p>You can:</p>
        <ul>
            <li>📊 View and filter <Link style={{color:"coral"}} href={"/dashboard"}>translations statistics</Link></li>
            <li>🔍 <Link style={{color:"coral"}} href={"/products"}>Search for and edit products</Link> relevant to your language</li>
            <li>🔖 <Link style={{color:"coral"}} href={"/manage-idmls"}>Label individual articles</Link> from inDesign documents uploaded to Crowdin</li>
            <li>⚠️ <Link style={{color:"coral"}} href={"/failures"}>Process</Link> failed products manually</li>
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
        <p>Note: Data on this site is refreshed in near-real time.<br/>In some cases, changes may take a few moments to show up on the website.</p>
      </div>        
    </div>
  );
}
