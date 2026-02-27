import { useState } from "react";
import { createColumnHelper } from '@tanstack/react-table'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
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

const exampleData = [
  { id: 1, title: "RV202503_ES", targetLang: 'Spanish', productStatus: 'completed', crowdinUrl: null, due: '1/21/2026', lastActivity: "12/5/2025", published: true, translationProg: 20, approvalProg: 15 },
  { id:2, title: "PT202603_FR", targetLang: 'French', productStatus: 'incomplete', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 70, approvalProg: 50 },
  { id: 3, title: "TB_SomeTitle_IT", targetLang: "Italian", productStatus: 'completed', crowdinUrl: 'https://crowdin.com/somefile', due: '1/21/2026', lastActivity: "12/5/2025", published: false, translationProg: 30, approvalProg: 10 },
  { id: 4, title: "MB_2026-02-27_title_DE", targetLang: 'German', productStatus: 'incomplete', crowdinUrl: 'https://crowdin.com/somefile', due: '2/28/2026', lastActivity: "2/27/2026", published: false, translationProg: 20, approvalProg: 15 }
]

export function Table({ onRowClick }) {
  const [data] = useState(exampleData)
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
        <tr key={row.id} onClick={() => onRowClick(row.original)}>
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