import type { AllProduct, ActiveProduct, ArchivedProduct } from "../../../shared/types"
import { queryAllProducts } from "../../services/api"
import { ClickFilter } from "./clickFilter"
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    createColumnHelper,
    flexRender,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { formatDate } from "../../services/formatDate"
import { groupDisplayNames } from "../../../shared/constants"
import { ProductModal } from "./ProductModal"
import { EditModal as CompletionModal } from "./CompletionModal"

const columnHelper = createColumnHelper<AllProduct>()

const SOURCE_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'deleted', label: 'Deleted' },
]

const columns = [
    columnHelper.accessor("source", {
        header: "Source",
        cell: info => (
            <span className={`all-products-source-badge all-products-source-badge--${info.getValue()}`}>
                {info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1)}
            </span>
        ),
        enableSorting: true,
        size: 90,
    }),
    columnHelper.accessor("title", { header: "Title", size: 280 }),
    columnHelper.accessor("productCode", { header: "Code", size: 100 }),
    columnHelper.accessor("targetLanguage", { header: "Language", size: 100 }),
    columnHelper.accessor("mediaGroups", {
        header: "Media",
        cell: info => (info.getValue() ?? []).map(t => groupDisplayNames[t] || t).join(", "),
        enableSorting: false,
        size: 150,
    }),
    columnHelper.accessor("datePublished", {
        header: "Published",
        cell: info => formatDate(info.getValue()),
        size: 120,
    }),
]

const PAGE_SIZE = 100

export function AllProductsTable() {
    const queryClient = useQueryClient()
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })
    const [sorting, setSorting] = useState([{ id: "datePublished", desc: true }])
    const [groupFilter, setGroupFilter] = useState<string | null>(null)
    const [sourceFilter, setSourceFilter] = useState('')
    const [titleInput, setTitleInput] = useState("")
    const [codeInput, setCodeInput] = useState("")
    const [langInput, setLangInput] = useState("")
    const [debouncedTextFilters, setDebouncedTextFilters] = useState({ title: "", code: "", lang: "" })
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const [selectedRow, setSelectedRow] = useState<AllProduct | null>(null)
    const [modalIsOpen, setModalIsOpen] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTextFilters({ title: titleInput, code: codeInput, lang: langInput })
            setPagination(prev => ({ ...prev, pageIndex: 0 }))
        }, 300)
        return () => clearTimeout(timer)
    }, [titleInput, codeInput, langInput])

    const sortState = sorting[0]
    const queryFilters = {
        page: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        title: debouncedTextFilters.title.trim() || undefined,
        code: debouncedTextFilters.code.trim() || undefined,
        lang: debouncedTextFilters.lang.trim() || undefined,
        group: groupFilter || undefined,
        source: sourceFilter || undefined,
        sortBy: sortState?.id,
        sortDir: sortState?.desc === false ? "asc" : "desc",
    }

    const { data: response = { data: [], totalCount: 0 }, isLoading, isError } = useQuery({
        queryKey: ["all-products", queryFilters],
        queryFn: () => queryAllProducts(queryFilters),
        placeholderData: keepPreviousData,
    })

    const { data = [], totalCount = 0 } = response
    const pageCount = Math.ceil(totalCount / pagination.pageSize) || 1

    const table = useReactTable({
        data,
        columns,
        state: { sorting, pagination },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount,
    })

    const rows = table.getRowModel().rows
    const parentRef = useRef<HTMLDivElement>(null)
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 75,
        overscan: 10,
    })

    const handleTabClick = (value: string | null) => {
        setActiveTab(value)
        setGroupFilter(value ?? null)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const handleSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSourceFilter(e.target.value)
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }

    const handleRowClick = (row: AllProduct) => {
        setSelectedRow(row)
        setModalIsOpen(true)
    }

    const onModalClose = () => {
        setModalIsOpen(false)
        queryClient.invalidateQueries({ queryKey: ["all-products"] })
    }

    const filterInputs: Record<string, [string, React.Dispatch<React.SetStateAction<string>>]> = {
        title: [titleInput, setTitleInput],
        productCode: [codeInput, setCodeInput],
        targetLanguage: [langInput, setLangInput],
    }

    const sourceDropdown = (
        <select
            className="table-filter"
            value={sourceFilter}
            onChange={handleSourceChange}
        >
            {SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )

    if (isLoading && data.length === 0) return <p className="generic-notice">Loading...</p>
    if (isError) return <p className="error-message">Error loading products.</p>

    return (
        <>
            {selectedRow && selectedRow.source === "active" && (
                <ProductModal
                    record={selectedRow as unknown as ActiveProduct}
                    isOpen={modalIsOpen}
                    onClose={onModalClose}
                />
            )}
            {selectedRow && selectedRow.source === "archived" && (
                <CompletionModal
                    record={selectedRow as unknown as ArchivedProduct}
                    isOpen={modalIsOpen}
                    onClose={onModalClose}
                />
            )}

            <h2 id="all-products-page-title">All Products</h2>
            <ClickFilter activeTab={activeTab} onTabClick={handleTabClick} />

            <div className="pagination-controls">
                <button
                    className="pagination-button"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </button>
                <span>Page {pagination.pageIndex + 1} of {pageCount}</span>
                <span>({totalCount} records)</span>
                <button
                    className="pagination-button"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </button>
            </div>

            <div ref={parentRef} className="all-products-scroll-container">
                <table id="all-products-table">
                    <thead id="all-products-table-head">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    const filterEntry = filterInputs[header.column.id]
                                    return (
                                        <th key={header.id}>
                                            <div
                                                className="table-sort-div"
                                                onClick={header.column.getToggleSortingHandler()}
                                                style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as "asc" | "desc"] ?? null}
                                            </div>
                                            {header.column.id === "source" ? sourceDropdown : filterEntry && (
                                                <input
                                                    className="table-filter"
                                                    placeholder="Filter..."
                                                    value={filterEntry[0]}
                                                    onChange={e => filterEntry[1](e.target.value)}
                                                />
                                            )}
                                        </th>
                                    )
                                })}
                            </tr>
                        ))}
                    </thead>
                    <tbody
                        id="all-products-table-body"
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            position: "relative",
                            display: "block",
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map(virtualRow => {
                            const row = rows[virtualRow.index]
                            return (
                                <tr
                                    key={row.id}
                                    className="table-row"
                                    data-source={row.original.source}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "65px",
                                        transform: `translateY(${virtualRow.start}px)`,
                                        cursor: "pointer",
                                        display: "grid",
                                        gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr 1fr",
                                        alignItems: "center",
                                    }}
                                    onClick={() => handleRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map(cell => (
                                        <td
                                            key={cell.id}
                                            className="table-data"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}
