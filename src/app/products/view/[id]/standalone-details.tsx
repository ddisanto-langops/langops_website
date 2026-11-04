import { apiRequest } from "@/app/lib/langops-api";
import { Suspense } from "react";

interface ComponentProps {
  params: Promise<{ id: string }>;
}

export async function ProductStandaloneDetails({ params }: ComponentProps) {
  const { id } = await params;

  const endpoint = `products/${id}`;
  const productDetails = await apiRequest(endpoint, { method: "GET" });
  const modalType = productDetails.status || "default-view";

  return (
    <>
      <div>
        <span>
          Product Deep-Dive Mode
        </span>
        <Suspense>
            <h1>
            Item ID: {id}
            </h1>
        </Suspense>
      </div>

      <div>
        {modalType === "pending" && <p>Standalone UI View for Pending Product {id}</p>}
        {modalType === "published" && <p>Standalone UI View for Published Product {id}</p>}
        {modalType === "default-view" && <p>Standard Standalone UI View for Product {id}</p>}
      </div>
    </>
  );
}