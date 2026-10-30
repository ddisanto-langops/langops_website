import { Suspense } from "react";
import { NavBar } from "../ui/nav";
import { ProductTable } from "./components/productTable";
import { Filter } from "../lib/filter";
import { UrlSearchProps } from "../lib/types";
import { apiRequest } from "../lib/langops-api";
import { toArray } from "@/app/lib/functions"
import { buildQuery } from "@/app/lib/functions";
import { GetProductFilters, PaginatedProductResponse } from "@/app/lib/types";



export default async function ProductsPage({ searchParams }: UrlSearchProps) {
    const params = await searchParams
    const filters: GetProductFilters = {
            targetLanguages: toArray(params.targetLanguages),
            productCodes: toArray(params.productCodes),
            mediaGroups: toArray(params.mediaGroups),
            status: toArray(params.status),
            search: params.search,
            dateFrom: params.dateFrom,
            dateTo: params.dateTo
    }
    const query = buildQuery(filters)
    const endpoint = `products?${query}`
    const products: PaginatedProductResponse = await apiRequest(endpoint, { method: 'GET' })
    
    return (
        <div>
            <NavBar />
            <Suspense>
                <Filter />
            </Suspense>
            <Suspense>
                <ProductTable products={products} />
            </Suspense>
        </div>
    )
}