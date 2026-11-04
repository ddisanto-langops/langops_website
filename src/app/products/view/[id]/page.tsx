
import { NavBar } from "@/app/ui/nav";
import { ProductStandaloneDetails } from "./standalone-details";
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
        <ProductStandaloneDetails params={params} />
       </Suspense>
      </main>
    </div>
  );
}
