"use client";

import { useState } from "react";
import { MenuButton } from "./components/menu-button";
import { Sidebar } from "./components/sidebar";
import styles from "@/app/ui/nav.module.css"

export function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false)

    const handleMenuButtonClick = () => {
        setMenuOpen(!menuOpen)
    }

    return (
        <div>
            <h1 className={styles.websiteTitle}>PCG LangOps</h1>
            <MenuButton menuOpen={menuOpen} handleButtonClick={handleMenuButtonClick} />
            {menuOpen ? <Sidebar /> : null}
        </div>

    )

}