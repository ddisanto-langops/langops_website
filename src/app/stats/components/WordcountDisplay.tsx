import styles from "@/app/stats/stats.module.css"
import { WordCountResponse } from "@/app/lib/types"

interface WordcountDisplayProps {
  wordcount: WordCountResponse
}

export function WordcountDisplay({ wordcount }: WordcountDisplayProps) {
  
  if (wordcount.totalWords) {
    return (
      <div className={styles.wordcount}>
        <span style={{ color: "coral" }}>Words Published:</span>{" "}
        {wordcount.totalWords.toLocaleString()}
      </div>
    )
  } else {
    return (
      <div className={styles.wordcount}>
        <span style={{ color: "white" }}>Words Published:</span>{" "}
        {0}
      </div>
    )
  } 
}