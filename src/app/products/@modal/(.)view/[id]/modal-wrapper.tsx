import { apiRequest } from "@/app/lib/langops-api";
import { ViewOnlyModal } from "@/app/ui/components/modals/view-only-modal";
import { LangOpsProduct } from "@/app/lib/types";
import { EditModal } from "@/app/ui/components/modals/edit-modal";

interface ModalDetailsProps {
  params: Promise<{ id: string }>;
}

export async function ModalWrapper({ params }: ModalDetailsProps) {
  const { id } = await params;
  
  const endpoint = `products/${id}`;
  const product: LangOpsProduct = await apiRequest(endpoint, { method: "GET" });
  const status = product.productStatus || "default-view";

  if (status === 'archived' || status === 'published') {
    return (
      <EditModal key={`edit-${id}`} product={product} />
    )
  } else {
    return (
      <ViewOnlyModal key={`view-${id}`} product={product}/>
    )
    
  }
}
