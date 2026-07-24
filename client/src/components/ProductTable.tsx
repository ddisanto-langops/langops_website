import { LangOpsProduct, GetProductFilters } from "@langops/shared/types"
import { supportedLanguageEnum, statusEnum } from "@langops/shared/enums"
import { NavBar } from "./NavBar"
import { ProductModal } from "./ProductModal"
import { EditModal } from "./EditModal"
import { ClickFilter } from "./clickFilter"
import { useQuery } from "@tanstack/react-query"
import React, { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  Row
} from '@tanstack/react-table'
import ISO6391 from "iso-639-1"
import { formatDate } from "../../services/formatDate";
import { getProducts } from "../../services/api";
import { data } from "react-router-dom"


const includesMediaType = (row: Row<LangOpsProduct>, columnId: string, filterValue: string) => {
  if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true
  const cellValue = row.getValue(columnId)
  if (cellValue == null) return false
  const filterArray = Array.isArray(filterValue) ? filterValue : [filterValue]
  const searchableValue = String(cellValue).toLowerCase()
  return filterArray.some(val => 
    searchableValue.includes(String(val).toLowerCase())
  )
}

const caseInsensitiveFilter = (row: Row<LangOpsProduct>, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;
  return cellValue.toString().toLowerCase().trim().includes(filterValue.toLowerCase().trim());
};

const columnHelper = createColumnHelper<LangOpsProduct>()

const columns = [
  columnHelper.accessor('trelloData.title', {
    header: 'Title',
    filterFn: caseInsensitiveFilter 
  }),
  columnHelper.accessor('trelloData.targetLanguage', {
    id: "Language",
    header: 'Language',
    filterFn: caseInsensitiveFilter,
    cell: info => {
      const code = String(info.getValue() ?? '')
      return ISO6391.getName(code) || code
    }
  }),
  columnHelper.accessor('productStatus', {
    id: "Status",
    header: 'Status',
    filterFn: caseInsensitiveFilter
  }),
  columnHelper.accessor('trelloData.dueDate', {
    header: 'Due',
    cell: info => formatDate(info.getValue())
  }),
  columnHelper.accessor('mediaGroups', {
  id: 'mediaType',
  enableHiding: true,
  filterFn: includesMediaType,
  })
]

export function ProductTable() {
  
  const [filters, setFilters] = useState<GetProductFilters>({
    targetLanguage: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    productCode: undefined,
    mediaGroups: undefined,
    search: undefined,
    limit: 50,
    offset: undefined,
    archivedOnly: undefined,
    publishedOnly: undefined,
    unpublishedOnly: undefined,
    excludeDeleted: undefined
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ mediaType: false })
  const [selectedRow, setSelectedRow] = useState<LangOpsProduct | undefined>(undefined)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters)
  })

  const products = response?.data ?? []

  const filteredData = useMemo(() => {
    if (!fromDate && !toDate) return products
    return products.filter(product => {
      const published = product.trelloData.datePublished
      if (!published) return false
      const pubDate = published.slice(0, 10)
      if (fromDate && pubDate < fromDate) return false
      if (toDate && pubDate > toDate) return false
      return true
    })
  }, [products, fromDate, toDate])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })


  const handleTableLimit = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilters({...filters, limit: Number(value)})
    e.preventDefault()
  }

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    value === undefined ? 
    setFilters({...filters, targetLanguage: undefined}) : 
    setFilters({...filters, targetLanguage: ISO6391.getCode(value)})
    e.preventDefault()
  }

  // NEED API FILTER FOR PRODUCT STATUS
  const handleStatusSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === 'published') setFilters({...filters, publishedOnly: true})
    if (value === 'pending') setFilters({...filters, unpublishedOnly: true})
  }

  const handleGroupChange = (groups: string[]) => {
    setSelectedGroups(groups)
    table.getColumn('mediaType')?.setFilterValue(groups.length ? groups : null)
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

  if (isLoading) return <p className="generic-notice">Loading...</p>
  if (isError) return <p className="error-message">Error loading products.</p>
  
  return (
  <>
  <NavBar />
  <GuardedProductModal />
  <ClickFilter selectedGroups={selectedGroups} onSelectionChange={handleGroupChange}/>
  <div className="date-filter-row">
    <label>From: <input id="date-picker" type="date" className="date-picker" value={fromDate} onChange={e => setFromDate(e.target.value)} /></label>
    <label>To: <input id="date-picker" type="date" className="date-picker" value={toDate} onChange={e => setToDate(e.target.value)} /></label>
  </div>
  <div className="pagination-div">
    <label>Products to display: 
      <select className="pagination-select" defaultValue={filters.limit} onChange={handleTableLimit}>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={30}>30</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
        <option value={100}>200</option>
        <option value={100}>300</option>
        <option value={100}>400</option>
        <option value={100}>500</option>
      </select>
    </label>
  </div>
  <table id="product-table">
    <thead id="product-table-head">
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                if (header.column.id === 'mediaType') {
                  return null
                }  else if (header.column.id === "Language") {
                  return (
                    <th>{header.id}
                      <div>
                      <label>
                        <select defaultValue={filters.targetLanguage} onChange={handleLanguageSelect}>
                          <option value={undefined}>All</option>
                          {supportedLanguageEnum.map((lang) => (
                            <option key={lang}>{lang}</option>
                          ))}
                        </select>
                      </label>
                      </div>
                    </th>
                  )

                } else if (header.column.id === "Status") {
                  return (
                  <th>{header.id}
                    <div>
                      <label>
                        <select>
                          {statusEnum.map((productStatus) => (
                            <option key={productStatus}>{productStatus}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </th>
                )
                } else {
                  return (
                  <th key={header.id}>
                  <div
                    className="table-sort-div"
                    title="Click to sort"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: 'pointer' }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc' ? ' ↑'
                    : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                  </div>
                  <input
                    className="table-filter"
                    placeholder="Filter..."
                    value={header.column.getFilterValue() as string}
                    onChange={e => header.column.setFilterValue(e.target.value)}
                  />
                  </th>
            )
                }
                
          

                 })}
            </tr>
        ))}
    </thead>
    <tbody id="product-table-body">
      {table.getRowModel().rows.map(row => (
        <tr className="table-row" style={{ cursor: 'pointer' }} key={row.id} onClick={() => handleRowClick(row.original)}>
          {row.getVisibleCells().map(cell => (
            <td className="table-data" key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
  </>
)}
