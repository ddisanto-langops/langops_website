import type { ApiFilters, ActiveProduct, ArchivedProduct } from "../../../shared/types";
import { globalSearchQuery } from "../../services/api";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";



export function GlobalSearch() {
    const PAGE_SIZE = 50

    const [searchData, setSearchData] = useState<Promise<ActiveProduct | ArchivedProduct> | null >(null)
    const [filters, setFilters] = useState<ApiFilters>({
        lang: undefined,
        code: undefined,
        group: undefined,
        from: undefined,
        to: undefined,
        title: undefined,
        page: undefined,
        pageSize: undefined,
        limit: undefined,
        sortBy: undefined,
        sortDir: undefined
    })

   
    useEffect(() => {
            setSearchData(globalSearchQuery(filters))
        }, [])
     

    const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
        const response = globalSearchQuery(filters)
        setSearchData(response)
    }
    
    
    return (
        <div>
            <div>
                <h1>Global Search</h1>
                <p>Note: This page allows searching of all products (active and completed), including restoration of deleted products.</p>
            </div>
            <div>
                <input placeholder="search anything..."></input>
                <button
                    type="button"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>
        </div>
    )
}