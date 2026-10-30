import { UrlSearchProps } from "../lib/types";
import { apiRequest } from "../lib/langops-api";
import { buildQuery } from "@/app/lib/functions";
import { toArray } from "@/app/lib/functions"
import { GetProductFilters, PaginatedProductResponse } from "@/app/lib/types";
import { ProductTable } from "./components/productTable";

export async function ProductData({ searchParams}: UrlSearchProps) {
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
            <ProductTable products={products} />
        </div>
    ) 
}