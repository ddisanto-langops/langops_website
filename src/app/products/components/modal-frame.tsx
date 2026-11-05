"use client";
import { useRouter } from "next/navigation";

export function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999 }}
      onClick={() => router.back()}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside content
      >
        <button 
          className="bg-white rounded-xl p-6 text-black max-w-md w-full relative"
          onClick={() => router.back()}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
