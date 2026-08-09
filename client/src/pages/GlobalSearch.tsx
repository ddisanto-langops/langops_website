import { NavBar } from "../components/NavBar";
import { LangOpsProduct, GetProductFilters } from "@shared/types";
import { AdaptiveModal } from "../components/AdaptiveModal";
import { getProducts } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { useState, KeyboardEvent } from "react";
import { GlobalSearchTable } from "../components/GlobalSearchTable";



export function GlobalSearchPage() {
    const [selectedRow, setSelectedRow] = useState<LangOpsProduct | undefined>(undefined)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [filters, setFilters] = useState<Partial<GetProductFilters>>({
        limit: 500,
        search: undefined
    })
    const [searchActive, setSearchActive] = useState(false)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['search-products', filters],
        queryFn: () => getProducts(filters!),
        enabled: !!filters
    })

    


    const handleSearch = () => {
        setFilters({...filters, search: search})
        setSearchActive(true)
    }

    const handleClear = () => {
        setFilters({...filters, search: undefined})
        setSearch("")
        setSearchActive(false)
    }


    const handleRowClick = (row: LangOpsProduct) => {
        setSelectedRow(row)
        setModalIsOpen(true)
    }
    
    const handleModalClose = () => {
        setModalIsOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch()
        }
    }

    if (isLoading) return (
        <>
            <NavBar />
            <p className="generic-notice">Loading...</p>
        </>
        
    )
    if (isError) return (
        <>
            <NavBar />
            <p className="error-message">No products found</p>
        </>
    )

    return (
        <>
            <NavBar />
            <AdaptiveModal row={selectedRow} isOpen={modalIsOpen} handleModalClose={handleModalClose} />
            <div className="search-input">
                <input 
                    className="search-box"
                    type="text"
                    placeholder="Search title or localized title..."
                    value={search || ""}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                 />
                 <button
                    className="interactive-button"
                    style={{cursor: 'pointer'}}
                    onClick={handleSearch}
                    >
                    Search
                 </button>
                 <button 
                    className="interactive-button"
                    style={{cursor: 'pointer'}}
                    type="submit" onClick={handleClear}
                    >
                    Clear
                 </button>
            </div>
            {
                searchActive && data ? 
                <GlobalSearchTable data={data.data} handleRowClick={handleRowClick} /> : 
                <p className="generic-notice" style={{maxWidth: '400px'}}>Search for products which don't appear in the table due to age or being deleted. Enter a title or localized title to continue.</p>
            }
            
        </>
    )
}