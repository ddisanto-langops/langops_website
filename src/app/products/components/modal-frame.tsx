"use client";
import { useRouter } from "next/navigation";

export function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
        onClick={() => router.back()}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside content
      >
        <button 
          onClick={() => router.back()}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
