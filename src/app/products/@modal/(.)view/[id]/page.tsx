import { ModalFrame } from "@/app/products/components/modal-frame";
import { Suspense } from "react";
import { ModalWrapper } from "./modal-wrapper";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InterceptedModalPage({ params }: Props) {



  return (
    <ModalFrame>
        <Suspense>
            <ModalWrapper params={params}/>
        </Suspense>
    </ModalFrame>
  );
}
