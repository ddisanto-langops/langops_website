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
                    value={"active"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">Active</label>
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"completed"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">Completed</label>
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"deleted"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">Deleted</label>
                <input
                    className="table-radio-selector"
                    type="radio"
                    name="table-select"
                    value={"all"}
                    onChange={handleSelect}
                >
                </input>
                <label htmlFor="products">All</label>
            </div>
            <div>
                {selectedTable === "" && <p className="generic-notice">Select a table above to get started.</p>}
                {selectedTable === "active" && <ProductTable />}
                {selectedTable === "completed" && <CompletionTable />}
                {selectedTable === "deleted" && <DeletionsTable />}
                {selectedTable === "all" && <AllProductsTable />}
                
            </div>
        </>
    )
}