import { UrlSearchProps, GetProductFilters, ProductCountRepsonse, WordCountResponse } from "../lib/types";
import { toArray, buildQuery } from "../lib/functions";
import { apiRequest } from "../lib/langops-api";
import { WordcountDisplay } from "./components/WordcountDisplay";
import { ProductCountDisplay } from "./components/ProductCountDisplay";

export async function StatsPageData({ searchParams }: UrlSearchProps) {
    const params = await searchParams
    
    const filters: Partial<GetProductFilters> = {
        targetLanguages: toArray(params.targetLanguages),
        productCodes: toArray(params.productCodes),
        mediaGroups: toArray(params.mediaGroups),
        dateFrom: params.dateFrom,
        dateTo: params.dateTo
    }
    
    const query = buildQuery(filters)

    const productCountEndpoint = `products/productcount?${query}`
    const productCount: ProductCountRepsonse = await apiRequest(productCountEndpoint, {method: 'GET'})

    const wordcountEndpoint = `products/wordcount?${query}`
    const wordcount: WordCountResponse = await apiRequest(wordcountEndpoint, {method: 'GET'})

    return (
        <div>
            <WordcountDisplay wordcount={wordcount} />
            <ProductCountDisplay productCount={productCount} />
        </div>
    )

}