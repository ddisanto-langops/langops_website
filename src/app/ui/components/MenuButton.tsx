"use client";

import { buttonStyles } from "@/app/lib/styles";

interface MenuButtonProps {
    menuOpen: boolean
    handleButtonClick: () => void
}

export function MenuButton({ menuOpen, handleButtonClick }: MenuButtonProps) {

    return (
        <div>
            <button
                className={`${buttonStyles} bg-sky-500 hover:bg-sky-700`}
                type="button"
                onClick={handleButtonClick}
            >
                {menuOpen? "Close Menu" : "Open Menu"}
            </button>
        </div>
    )
}