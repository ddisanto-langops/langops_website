import { fetchAdminCompletions } from "../../services/api"
import { ClickFilter } from "./clickFilter";
import { useQuery } from "@tanstack/react-query"
import { useState, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
  flexRender
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { formatDate } from "../../services/formatDate"

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor('title', { header: 'Title' }),
  columnHelper.accessor('productCode', { header: 'Product Code' }),
  columnHelper.accessor('targetLang', { header: 'Language' }),
  columnHelper.accessor('mediaType', {
    header: 'Media Type',
    cell: (info) => info.getValue()?.join(', '),
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
  const tableContainerRef = useRef(null)

  const table = useReactTable({
    data,
    columns, // Reference to the array above
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 54,
    getScrollElement: () => tableContainerRef.current,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalSize = rowVirtualizer.getTotalSize()

  const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end || 0)
      : 0

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Error loading products.</p>

  return (
    <>
      <h2 id='completions-page-title'>Completions</h2>
      <ClickFilter onTabClick={(val) => table.getColumn('mediaType').setFilterValue(val)}/>
      
      <div 
        ref={tableContainerRef} 
        style={{ height: '80vh', overflow: 'auto', position: 'relative' }} 
      >
        <table id="completions-table" style={{ width: '100%' }}>
          <thead id="completions-table-head">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    <div
                      className="table-sort-div"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ cursor: 'pointer' }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted()] ?? null}
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
          
          <tbody id="completions-table-body">
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} colSpan={columns.length} />
              </tr>
            )}

            {virtualRows.map(virtualRow => {
              const row = rows[virtualRow.index]
              return (
                <tr 
                  key={row.id}
                  className="table-row" 
                  onClick={() => onRowClick(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td className="table-data" key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              )
            })}

            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} colSpan={columns.length} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
