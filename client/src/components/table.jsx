import { fetchProducts } from "../../services/api"
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

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
  }),
  columnHelper.accessor('targetLang', {
    header: 'Language',
  }),
  columnHelper.accessor('productStatus', {
    header: 'Status',
  }),
  columnHelper.accessor('due', {
    header: 'Due',
  }),
]

export function Table({ onRowClick }) {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  })
  
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
  <table>
    <thead>
        {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id}>
                  <div
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
                  value={header.column.getFilterValue() ?? ''}
                  onChange={e => header.column.setFilterValue(e.target.value)}
                />
                </th>
            ))}
            </tr>
        ))}
    </thead>
    <tbody>
      {table.getRowModel().rows.map(row => (
        <tr className="table-row" style={{ cursor: 'pointer' }} key={row.id} onClick={() => onRowClick(row.original)}>
          {row.getVisibleCells().map(cell => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)}