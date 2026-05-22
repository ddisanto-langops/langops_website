import React, { useState } from "react"
import { ProductTable } from "../components/ProductTable"
import { CompletionTable } from "../components/CompletionTable"
import { AllProductsTable } from "../components/AllProductsTable"
import { NavBar } from "../components/NavBar"
import { DeletionsTable } from "../components/DeletionsTable"

export function GlobalSearchPage() {
    const [selectedTable, setSelectedTable] = useState("")

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTable(e.target.value)
    }

    return (
        <>
            <NavBar />
            <div id="global-table-selection-div">
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"products"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">Active Products</label>
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"completions"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">Completions</label>
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"all"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">All</label>
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"deletions"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">Deletions</label>
            </div>
            <div>
                {selectedTable === "" && <p className="generic-notice">Select a table above to get started.</p>}
                {selectedTable === "products" && <ProductTable />}
                {selectedTable === "completions" && <CompletionTable />}
                {selectedTable === "all" && <AllProductsTable />}
                {selectedTable === "deletions" && <DeletionsTable />}
            </div>
        </>
    )
}