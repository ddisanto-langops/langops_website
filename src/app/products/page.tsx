import { Suspense } from "react";
import { NavBar } from "../ui/nav";
import { ProductTable } from "./components/productTable";
import { Filter } from "../lib/filter";
import { UrlSearchProps } from "../lib/types";



export default async function ProductsPage({ searchParams }: UrlSearchProps) {

    
    return (
        <div>
            <NavBar />
            <Suspense>
                <Filter />
            </Suspense>
            <Suspense>
                <ProductTable searchParams={searchParams} />
            </Suspense>
        </div>
    )
}