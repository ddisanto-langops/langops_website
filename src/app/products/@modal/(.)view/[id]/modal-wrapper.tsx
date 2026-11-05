import { apiRequest } from "@/app/lib/langops-api";
import { ViewOnlyModal } from "./view-only-modal";
import { LangOpsProduct } from "@/app/lib/types";

interface ModalDetailsProps {
  params: Promise<{ id: string }>;
}

export async function ModalWrapper({ params }: ModalDetailsProps) {
  const { id } = await params;
  
  const endpoint = `products/${id}`;
  const product: LangOpsProduct = await apiRequest(endpoint, { method: "GET" });
  const status = product.productStatus || "default-view";

  if (status === 'archived' || status === 'published') {
    // return edit-modal
    return (
      <p>Placeholder for Edit Modal</p>
    )
  } else {
    return (
      <ViewOnlyModal product={product}/>
    )
    
  }
}
