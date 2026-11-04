import { apiRequest } from "@/app/lib/langops-api";

interface ModalDetailsProps {
  params: Promise<{ id: string }>;
}

export async function ModalDetails({ params }: ModalDetailsProps) {
  const { id } = await params;
  
  const endpoint = `products/${id}`;
  const productDetails = await apiRequest(endpoint, { method: "GET" });
  const modalType = productDetails.status || "default-view";

  return (
    <div className="prose">
      {modalType === "pending" && <p>Modal UI for Pending Product {id}</p>}
      {modalType === "published" && <p>Modal UI for Published Product {id}</p>}
      {modalType === "default-view" && <p>Standard Modal UI for Product {id}</p>}
    </div>
  );
}
