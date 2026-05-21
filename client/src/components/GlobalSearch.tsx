import type { ApiFilters, ActiveProduct, ArchivedProduct, GlobalSearchRecord } from "../../../shared/types";
import { fetchCompletions, fetchProducts, globalSearchQuery } from "../../services/api";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";



export function GlobalSearchTable() {
    const [productData, setProductData] = useState<ActiveProduct[]>([])
    const [completionsData, setCompletionsData] = useState<ArchivedProduct[]>([])
    const [search, setSearch] = useState("")
    
    const {data: products} = useQuery<ActiveProduct[], Error>({
        queryKey: ['products'],
        queryFn: fetchProducts
    })

    const { data: completions } = useQuery<ArchivedProduct[], Error>({
        queryKey: ['completions'],
        queryFn: fetchCompletions
    })

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value.toLowerCase())
        if (products) {
            const filteredProducts = products.filter((product) => product.title.toLowerCase().includes(search))
            setProductData(filteredProducts)
        }
        
        if (completions) {
            const filteredCompletions = completions.filter((completion) => completion.title.toLowerCase().includes(search))
            setCompletionsData(filteredCompletions)
        } 
    }

    
    
    return (
        <div>
            <div>
                <h1>Global Search</h1>
                <p>Note: This page allows searching of all products (active and completed), including restoration of deleted products.</p>
            </div>
            <div>
                <input 
                    placeholder="search by title..."
                    onChange={handleSearch}
                >
                </input>

            </div>
            <div className="global-results-div">   
                <table>
                    <thead>
                        <h3>Products</h3>
                        <tr>
                            <th>Title</th>
                            <th>Language</th>
                            <th>Media Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            productData.map((item: ActiveProduct) => (
                                <tr>
                                    <td>{item.title}</td>
                                    <td>{item.targetLanguage}</td>
                                    <td>{item.mediaGroups}</td>
                                </tr>
                                
                                ) 
                            )
                        }
                    </tbody>
                </table>
                <table>
                    <thead>
                        <h3>Completions</h3>
                        <tr>
                            <th>Title</th>
                            <th>Language</th>
                            <th>Media Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            completionsData.map((item: ArchivedProduct) => (
                                <tr>
                                    <td>{item.title}</td>
                                    <td>{item.targetLanguage}</td>
                                    <td>{item.mediaGroups}</td>
                                </tr>
                                
                                ) 
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}