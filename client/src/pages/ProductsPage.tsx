import { GetProductFilters, LangOpsProduct } from "@langops-website/shared";
import { NavBar } from "../components/NavBar";
import { ProductTable } from "../components/ProductTable";
import { ProductFilter } from "../components/ProductFilter";
import { AdaptiveModal } from "../components/AdaptiveModal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/api";
import { Footer } from "../components/footer";


export function ProductsPage() {

    const defaultFilters: GetProductFilters = {
        targetLanguages: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        productCodes: undefined,
        mediaGroups: undefined,
        search: undefined,
        limit: 50,
        offset: undefined,
        status: undefined
    }
    const [filters, setFilters] = useState(defaultFilters)

    
    const [selectedRow, setSelectedRow] = useState<LangOpsProduct | undefined>(undefined)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ['products', filters],
        queryFn: () => getProducts(filters)
    })
    
    // Safely check if response is a valid response object with a data array
    const products = (response && 'data' in response && Array.isArray(response.data)) ? response.data : []

    const handleRowClick = (row: LangOpsProduct) => {
        setSelectedRow(row)
        setModalIsOpen(true)
    }

    const handleModalClose = () => {
        setModalIsOpen(false)
        setSelectedRow(undefined)
    }

    
    return (
        <>
            <NavBar />
            <AdaptiveModal row={selectedRow} isOpen={modalIsOpen} handleModalClose={handleModalClose} />
            <ProductFilter filters={filters} defaultFilters={defaultFilters} setFilters={setFilters}/>
            <ProductTable data={products} isLoading={isLoading} isError={isError} handleRowClick={handleRowClick} />
            <Footer />
        </>
    )
}