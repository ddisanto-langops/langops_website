import { apiRequest } from "@/app/lib/langops-api";
import { LangOpsProduct, TrelloDataSchema } from "@/app/lib/types";
import { ProductData } from "@/app/products/ProductPageData";

interface ModalDetailsProps {
  params: Promise<{ id: string }>;
}

export async function ModalData({ params }: ModalDetailsProps) {
  const { id } = await params;
  
  const endpoint = `products/${id}`;
  const product: LangOpsProduct = await apiRequest(endpoint, { method: "GET" });
  const status = product.productStatus

  return (
    <div className="bg-blue-500 justify-self-center rounded-md p-4">
      <p>Title: {product.trelloData.title}</p>
      <p>{product.trelloData.targetLanguage}</p>
      <p>{status}</p>
    </div>
  );
}
