import { fetchAdminCompletions } from "../../services/api"
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
import { formatDate } from "../../services/dateFormat"

const includesMediaType = (row, columnId, filterValue) => {
  if (!filterValue || filterValue.length === 0) return true
  const cellValue = row.getValue(columnId)
  if (!cellValue) return false
  const filterArray = Array.isArray(filterValue) ? filterValue : [filterValue]
  return filterArray.some(val => cellValue?.includes(val))
}



const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
  }),
  columnHelper.accessor('productCode', {
    header: 'Product Code',
  }),
  columnHelper.accessor('targetLang', {
    header: 'Language',
  }),
  columnHelper.accessor('mediaType', {
    header: 'Media Type',
    cell: (info) => {
    const value = info.getValue()
    if (!value || value.length === 0) return 'N/A'
    return value.join(', ')
    },
    filterFn: includesMediaType,
  }),
  columnHelper.accessor('datePublished', {
    header: 'Date Published',
    cell: info => formatDate(info.getValue())
  })
]


export function CompletionsTable({ onRowClick }) {
  
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['completions'],
    queryFn: fetchAdminCompletions
  })

  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [activeTab, setActiveTab] = useState(null)

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

  const handleTabClick = (value) => {
    setActiveTab(value)
    table.getColumn('mediaType').setFilterValue(value)
  }

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading products.</p>

  return (
    <>
    <h1 id='completions-page-title'>Completions</h1>
    <ClickFilter onTabClick={handleTabClick}/>
    <table id="completions-table">
      <thead id="completions-table-head">
        {table.getHeaderGroups().map(headerGroup => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map(header => {
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
                value={header.column.getFilterValue() ?? ''}
                onChange={e => header.column.setFilterValue(e.target.value)}
              />
              </th>
          )})}
          </tr>
        ))}
      </thead>
      <tbody id="completions-table-body">
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
  )
}