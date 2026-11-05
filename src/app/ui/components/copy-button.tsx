"use client";

import { useState } from "react";

interface CopyButtonProps {
    buttonText: string
    textToCopy: string
}

export default function CopyButton({ buttonText, textToCopy}: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy)
        setIsCopied(true)
        setTimeout(() => {
            setIsCopied(false);
        }, 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={`cursor-pointer px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                isCopied 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
            {buttonText}
        </button>
    )
}
