import styles from "@/app/ui/nav.module.css"

export function Sidebar() {
    return (
        <div className={styles.sidebar}>
            <a>Translation Statistics</a>
            <a>View & Search Products</a>
            <a>Label IDML Files</a>
            <a>Manage Failed Products</a>
            <a>View API Docs</a>
        </div>
    )
}