import type { ActiveProduct } from "../../../shared/types";
import type { SortingState, ColumnFiltersState, Row, VisibilityState } from "@tanstack/react-table"

import { fetchProducts } from "../../services/api"
import { ClickFilter } from "./clickFilter";
import { useQuery } from "@tanstack/react-query"
import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'
import { formatDate } from "../../services/formatDate";

const includesMediaType = (row: Row<ActiveProduct>, columnId: string, filterValue: string) => {
  if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true
  const cellValue = row.getValue(columnId)
  if (cellValue == null) return false
  const filterArray = Array.isArray(filterValue) ? filterValue : [filterValue]
  const searchableValue = String(cellValue).toLowerCase()
  return filterArray.some(val => 
    searchableValue.includes(String(val).toLowerCase())
  )
}

const caseInsensitiveFilter = (row: Row<ActiveProduct>, columnId: string, filterValue: string) => {
  if (!filterValue) return true;
  const cellValue = row.getValue(columnId);
  if (!cellValue) return false;
  return cellValue.toString().toLowerCase().includes(filterValue.toLowerCase());
};

const columnHelper = createColumnHelper<ActiveProduct>()

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
    filterFn: caseInsensitiveFilter 
  }),
  columnHelper.accessor('targetLanguage', {
    header: 'Language',
    filterFn: caseInsensitiveFilter
  }),
  columnHelper.accessor('productStatus', {
    header: 'Status',
    filterFn: caseInsensitiveFilter
  }),
  columnHelper.accessor('dueDate', {
    header: 'Due',
    cell: info => formatDate(info.getValue())
  }),
  columnHelper.accessor('mediaGroups', {
  id: 'mediaType',
  enableHiding: true,
  filterFn: includesMediaType,
  })
]

interface ProductTableProps {
  onRowClick: (row: ActiveProduct) => void
}

export function ProductTable({ onRowClick }: ProductTableProps) {
 
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  })


  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ mediaType: false })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handleTabClick = (value: string | null) => {
    setActiveTab(value)
    table.getColumn('mediaType')?.setFilterValue(value)
  }

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading products.</p>
  
  return (
  <>
  <h2 id='products-page-title'>Products</h2>
  <ClickFilter activeTab={activeTab} onTabClick={handleTabClick}/>
  <table id="product-table">
    <thead id="product-table-head">
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                if (header.column.id === 'mediaType') return null
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
            )})}
            </tr>
        ))}
    </thead>
    <tbody id="product-table-body">
      {table.getRowModel().rows.map(row => (
        <tr className="table-row" style={{ cursor: 'pointer' }} key={row.id} onClick={() => onRowClick(row.original)}>
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