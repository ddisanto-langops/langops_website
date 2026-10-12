import styles from '@/app/stats/stats.module.css'
import { apiRequest } from '@/app/lib/langops-api'

interface Wordcount {
    totalWords: string
}

export async function Wordcount() {
    const options: RequestInit = {
        method: 'GET'
    }
    const words: Wordcount = await apiRequest("products/wordcount", options)
        
    
    return (
        <div className={styles.wordcount}>
            <span style={{color: 'white'}}>Words Published:</span><span> </span>
            {words.totalWords.toLocaleString()}
        </div>

    )
}


    