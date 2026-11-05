import { ModalFrame } from "@/app/products/components/modal-frame";
import { ModalData } from "./modal-data";
import { Suspense } from "react";

// Import your sub-modals here (e.g., ProfileModal, InvoiceModal)

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InterceptedModalPage({ params }: Props) {



  return (
    <ModalFrame>
        <Suspense>
            <ModalData params={params}/>
        </Suspense>
    </ModalFrame>
  );
}
