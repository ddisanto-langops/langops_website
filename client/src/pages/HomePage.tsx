import { Link } from 'react-router-dom'

export function HomePage() {
    return (
        <>
            <div className='homepage-title-div'>
                <h1>PCG LangOps Website</h1>
                <p id='homepage-blurb'>Welcome to the PCG LangOps website. From here you can view translation stats, explore active and completed content, and manage the entire translation workflow of inDesign documents.</p>
            </div>
            <div className='homepage-links-div'>
                <Link to={"/dashboard"} className='homepage-link'>View Translation Stats</Link>
                <Link to={"/products"} className='homepage-link'>Explore Active & Completed Products</Link>
                <Link to={"/manage-idmls"} className='homepage-link'>Manage IDMLs</Link>
            </div>
        </>
    )
}