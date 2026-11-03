"use client";

import { LangOpsProduct } from "@/app/lib/types";
import { useState } from "react";

interface ViewingModalProps {
  record: LangOpsProduct
}

export function ViewingModal({ record }: ViewingModalProps) {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(!open)
  }
  if (!open) return null 
  return (
    <div>
      <p>View Product</p>
    </div>
  )
  
}