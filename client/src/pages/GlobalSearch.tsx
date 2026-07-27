import { NavBar } from "../components/NavBar";
import { LangOpsProduct, GetProductFilters } from "@shared/types";
import { ProductModal } from "../components/ProductModal";
import { EditModal } from "../components/EditModal";
import { getProducts } from "../../services/api";
import { useQuery } from "@tanstack/react-query";
import { useState, KeyboardEvent } from "react";



export function GlobalSearchPage() {
    const [selectedRow, setSelectedRow] = useState<LangOpsProduct | undefined>(undefined)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [filters, setFilters] = useState<Partial<GetProductFilters>>({
        limit: 10,
        search: undefined
    })

    const { data, isLoading, isError } = useQuery({
        queryKey: ['search-products', filters],
        queryFn: () => getProducts(filters!),
        enabled: !!filters.search
    })

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSearch()
        }
    }


    const handleSearch = () => {
        setFilters({...filters, search: search})
    }

    const handleClear = () => {
        setFilters({...filters, search: undefined})
        setSearch("")
    }


    const handleRowClick = (row: LangOpsProduct) => {
        setSelectedRow(row)
        setModalIsOpen(true)
    }
    
    const handleModalClose = () => {
        setModalIsOpen(false)
    }

    const GuardedProductModal = () => {
        if (!selectedRow) return null
        
        if (selectedRow.productStatus === "published") return ( <EditModal record={selectedRow} isOpen={modalIsOpen} onClose={handleModalClose} />)
        
          return (
          <ProductModal record={selectedRow} isOpen={modalIsOpen} onClose={handleModalClose} />
        )
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
        <div>
            <GuardedProductModal />
            <div>
                <NavBar />
            </div>
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
            <div className="search-table">
                {filters.search ?
                    <table>
                        <thead>
                            <th>Title</th>
                            <th>Status</th>
                        </thead>
                        <tbody>
                            {data?.data.map((row) => (
                                <tr onClick={() => handleRowClick(row)}>
                                    <td >{row.trelloData.title}</td>
                                    <td>{row.productStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table> : 
                    <p className="generic-notice" style={{maxWidth: '400px'}}>Search for products which don't appear in the table due to age or being deleted. Enter a title or localized title to continue.</p>
            }
                
            </div>
        </div>
        
    )
}