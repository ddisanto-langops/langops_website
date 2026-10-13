"use client";

import { useState } from "react";
import { MenuButton } from "./components/Dropdown/MenuButton";
import { Sidebar } from "./components/Dropdown/Sidebar";
import Link from "next/link";
import styles from "@/app/ui/nav.module.css"

export function NavBar() {
    const [menuOpen, setMenuOpen] = useState(false)

    const handleMenuButtonClick = () => {
        setMenuOpen(!menuOpen)
    }

    return (
        <div>
            <h1 className={styles.websiteTitle}><Link href={"/"}>PCG LangOps</Link></h1>
            <MenuButton menuOpen={menuOpen} handleButtonClick={handleMenuButtonClick} />
            {menuOpen ? <Sidebar /> : null}
        </div>

    )

}