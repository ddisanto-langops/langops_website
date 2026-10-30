import { Suspense } from "react";
import { NavBar } from "../ui/nav";
import { UrlSearchProps } from "../lib/types";
import { Filter } from "../lib/filter";
import { ProductData } from "./ProductPageData";






export default function ProductsPage({ searchParams }: UrlSearchProps) {
    
    return (
        <div>
            <NavBar />
            <Suspense>
                <Filter />
            </Suspense>
            <Suspense>
                <ProductData searchParams={searchParams} />
            </Suspense>
        </div>
    )
}