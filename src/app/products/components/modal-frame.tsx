"use client";
import { useRouter } from "next/navigation";

export function ModalFrame({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        onClick={() => router.back()}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative rounded-lg p-6  w-[50%] text-white shadow-xl z-10 border-2 border-solid border-orange-400 rounded-md p-4 bg-slate-800/70"
      >
        <button 
          className="absolute top-4 right-4 bg-white p-2 text-black rounded-md cursor-pointer hover:bg-zinc-200"
          onClick={() => router.back()}
        >
          ✕
        </button>
        <div className="mt-2">
          {children}
        </div>
      </div>

    </div>
  );
}
