import React, { useState } from "react"
import { ProductTable } from "../components/ProductTable"
import { CompletionTable } from "../components/CompletionTable"
import { AllProductsTable } from "../components/AllProductsTable"
import { NavBar } from "../components/NavBar"

export function GlobalSearchPage() {
    const [selectedTable, setSelectedTable] = useState("")

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTable(e.target.value)
    }

    return (
        <>
            <NavBar />
            <input
                type="radio"
                name="table-select"
                value={"products"}
                onChange={handleSelect}
            >
            </input>
            <label htmlFor="products">Products</label>
            <input
                type="radio"
                name="table-select"
                value={"completions"}
                onChange={handleSelect}
            >
            </input>
            <label htmlFor="products">Completions</label>
            <input
                type="radio"
                name="table-select"
                value={"all"}
                onChange={handleSelect}
            >
            </input>
            <label htmlFor="products">All</label>
            <input
                type="radio"
                name="table-select"
                value={"deletions"}
                onChange={handleSelect}
            >
            </input>
            <label htmlFor="products">Deletions</label>

            <div>
                {selectedTable === "products" && <ProductTable />}
                {selectedTable === "completions" && <CompletionTable />}
                {selectedTable === "all" && <AllProductsTable />}
            </div>
        </>
    )
}