import { Suspense } from "react";
import { NavBar } from "../ui/nav";
import { ProductTable } from "./components/productTable";



export default async function ProductsPage() {

    
    return (
        <div>
            <NavBar />
            <Suspense>
                <ProductTable />
            </Suspense>
        </div>
    )
}