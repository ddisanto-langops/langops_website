
import { NavBar } from "@/app/ui/nav";
import { ModalWrapper } from "../../@modal/(.)view/[id]/modal-wrapper";
import { Suspense } from "react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function StandaloneProductPage({ params }: Props) {

  return (
    <div>
      <NavBar /> 
      <main>
       <Suspense>
        <ModalWrapper params={params} />
       </Suspense>
      </main>
    </div>
  );
}
