import { apiRequest } from "@/app/lib/langops-api";
import { Suspense } from "react";
import ISO6391 from 'iso-639-1'
import { LangOpsProduct } from "@/app/lib/types";

interface ComponentProps {
  params: Promise<{ id: string }>;
}

export async function ProductStandaloneDetails({ params }: ComponentProps) {
  const { id } = await params;

  const endpoint = `products/${id}`;
  const productDetails: LangOpsProduct = await apiRequest(endpoint, { method: "GET" });

  return (
    <>
      <div className="flex-col justify-self-center text-center border-2 border-solid border-orange-400 rounded-md p-4">
        <span className="font-bold text-white text-xl">
          Product Details
        </span>
        <Suspense fallback="Loading...">
            <div className="text-white grid grid-cols-2 p-4 gap-4">
                <h2>Title:</h2>
                <input 
                    disabled={true} 
                    defaultValue={productDetails.trelloData.title}
                    className="field-sizing-content rounded-md bg-sky-500/50 p-2"
                >
                </input>
                <h2>Localized Title:</h2>
                <input 
                    disabled={true} 
                    defaultValue={productDetails.trelloData.localizedTitle}
                    className="field-sizing-content rounded-md bg-sky-500/50 p-2"
                >
                </input>
                <h2>Language:</h2>
                <input
                  disabled={true}
                  defaultValue={ISO6391.getName(productDetails.trelloData.targetLanguage)}
                  className="field-sizing-content rounded-md bg-sky-500/50 p-2"
                >
                </input>
            </div>
        </Suspense>
      </div>
    </>
  );
}