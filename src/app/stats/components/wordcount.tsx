import styles from '@/app/stats/stats.module.css'

interface Wordcount {
    totalWords: string
}

export async function Wordcount() {
    const basepath = process.env.BASEPATH
    const res = await fetch(
        `${basepath}/products/wordcount`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'CF-Access-Client-Id': `${process.env.CF_ACCESS_CLIENT_ID}`,
                'CF-Access-Client-Secret': `${process.env.CF_ACCESS_CLIENT_SECRET}`
            }
        }
    )

    const words: Wordcount = await res.json()
    return (
        <div className={styles.wordcount}>
            <span style={{color: 'white'}}>Total Words Published:</span><span> </span>
            {words.totalWords.toLocaleString()}
        </div>

    )
}


    