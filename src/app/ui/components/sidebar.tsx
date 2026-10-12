import styles from "@/app/ui/nav.module.css"
import Link from "next/link"

export function Sidebar() {
    return (
        <div className={styles.sidebar}>
            <Link href={"/stats"}>Translation Statistics</Link>
            <a>View & Search Products</a>
            <a>Label IDML Files</a>
            <a>Manage Failed Products</a>
            <a>View API Docs</a>
        </div>
    )
}