import {
  LangOpsProduct, 
  GetProductFilters,
  supportedLanguageEnum,
  statusEnum
} from "@langops-website/shared"
import { NavBar } from "./NavBar"
import { AdaptiveModal } from "./AdaptiveModal"
import { ClickFilter } from "./clickFilter"
import { useQuery } from "@tanstack/react-query"
import React, { useState, useMemo } from "react"
import Select, { MultiValue } from "react-select"
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
import { Link } from "react-router-dom"
import { formatDate } from "../../services/formatDate";
import { getProducts } from "../../services/api";
import { customStylesMulti } from "./styles/dropdownMulti"

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
    cell: info => formatDate(info.getValue()),
    filterFn: caseInsensitiveFilter
  }),
  columnHelper.accessor('mediaGroups', {
    id: 'mediaType',
    enableHiding: true,
    filterFn: includesMediaType,
  })
]

export function ProductTable() {
  const [filters, setFilters] = useState<GetProductFilters>({
    targetLanguages: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    productCodes: undefined,
    mediaGroups: undefined,
    search: undefined,
    limit: 50,
    offset: undefined,
    status: undefined
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ mediaType: false })
  const [selectedRow, setSelectedRow] = useState<LangOpsProduct | undefined>(undefined)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters)
  })

  // Safely check if response is a valid response object with a data array
  const products = (response && 'data' in response && Array.isArray(response.data)) ? response.data : []

  const filteredData = useMemo(() => {
    if (!filters.dateFrom && !filters.dateTo) return products
    return products.filter(product => {
      const published = product.trelloData?.datePublished
      if (!published) return false
      const pubDate = published.slice(0, 10)
      if (filters.dateFrom && pubDate < filters.dateFrom) return false
      if (filters.dateTo && pubDate > filters.dateTo) return false
      return true
    })
  }, [products, filters.dateFrom, filters.dateTo])

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

  const handleLanguageSelect = (choice: MultiValue<{value: string, label: string}>) => {
    const languages = choice.map(item => item.value)
    setFilters({...filters, targetLanguages: languages})
  }

  const handleStatusSelect = (choice: MultiValue<{value: string, label: string}>) => {
    const statuses = choice.map(item => item.value)
    setFilters({...filters, status: statuses})
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

  if (isLoading) return <p className="generic-notice">Loading...</p>
  if (isError) {
    return <p className="error-message">Error loading products.</p>
  }
  
  const hasRows = table.getRowModel().rows.length > 0

  return (
    <>
      <AdaptiveModal row={selectedRow} isOpen={modalIsOpen} handleModalClose={handleModalClose} />
      <ClickFilter selectedGroups={selectedGroups} onSelectionChange={handleGroupChange}/>
      <div className="date-filter-row">
        <div className="date-picker-div">
          <label htmlFor="date-picker-from">From: </label>
          <input id="date-picker-from" type="date" className="date-picker" value={filters.dateFrom} onChange={e => setFilters({...filters, dateFrom: e.target.value})} />
        </div>
        <div className="date-picker-div">
          <label htmlFor="date-picker-to">To: </label>
          <input id="date-picker-to" type="date" className="date-picker" value={filters.dateTo} onChange={e => setFilters({...filters, dateTo: e.target.value})} />
        </div>
      </div>
      <div className="pagination-div">
        <label>Products to display: 
          <select className="pagination-select" value={filters.limit} onChange={handleTableLimit}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
            <option value={400}>400</option>
            <option value={500}>500</option>
          </select>
        </label>
        <p className="generic-notice">Note: If products do not show up here, they may be out of range. Use the <Link style={{margin: '0px', fontSize: 'medium'}} to={"/search"} className='navbar-link'>search</Link> page instead.</p>
      </div>
      <table id="product-table">
        <thead id="product-table-head">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                if (header.column.id === 'mediaType') {
                  return null
                } else if (header.column.id === "Language") {
                  return (
                    <th key={header.id}>{header.id}
                      <div>
                        <label>
                          <Select
                            isMulti
                            isClearable
                            isSearchable
                            styles={customStylesMulti}
                            value={(filters.targetLanguages || []).map((code) => ({
                              value: code,
                              label: ISO6391.getName(code) || code
                            }))}
                            options={supportedLanguageEnum.map((lang) => ({ value: ISO6391.getCode(lang), label: lang}))
                              .sort((a, b) => a.label.localeCompare(b.label))
                            }
                            onChange={handleLanguageSelect}                          
                          />
                        </label>
                      </div>
                    </th>
                  )
                } else if (header.column.id === "Status") {
                  return (
                    <th key={header.id}>{header.id}
                      <div>
                        <label>
                          <Select
                            isMulti
                            isClearable
                            isSearchable
                            styles={customStylesMulti}
                            value={(filters.status || []).map((code) => (
                              {value: code.toLowerCase(), label: code}
                            ))}
                            options={statusEnum.map((code) => (
                              {value: code.toLowerCase(), label: code}
                              ))
                              .sort((a, b) => a.label.localeCompare(b.label))
                            }
                            onChange={handleStatusSelect}
                          />
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
                        value={(header.column.getFilterValue() as string) ?? ''}
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
          {
            table.getRowModel().rows.map(row => (
              <tr className="table-row" style={{ cursor: 'pointer' }} key={row.id} onClick={() => handleRowClick(row.original)}>
                {row.getVisibleCells().map(cell => (
                  <td className="table-data" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </>
  )
}