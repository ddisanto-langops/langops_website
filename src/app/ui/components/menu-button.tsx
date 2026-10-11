"use client";

import styles from "@/app/ui/nav.module.css"

interface MenuButtonProps {
    menuOpen: boolean
    handleButtonClick: () => void
}

export function MenuButton({ menuOpen, handleButtonClick }: MenuButtonProps) {

    return (
        <div>
            <button
                className={styles.menuButton}
                type="button"
                onClick={handleButtonClick}
            >
                {menuOpen? "Close Menu" : "Open Menu"}
            </button>
        </div>
    )
}