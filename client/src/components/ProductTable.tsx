import { LangOpsProduct } from "@langops-website/shared"
import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  Row
} from '@tanstack/react-table'
import ISO6391 from "iso-639-1"
import { formatDate } from "../../services/formatDate";

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
  })
]


interface ProductTableProps {
  data: LangOpsProduct[]
  isLoading: boolean
  isError: boolean
  handleRowClick: (row: LangOpsProduct) => void
}

export function ProductTable({ data, isLoading, isError, handleRowClick }: ProductTableProps) {

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  

  

  

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  

  if (isLoading) return <p className="generic-notice">Loading...</p>
  if (isError) {
    return <p className="error-message">Error loading products.</p>
  }

  if (data.length === 0) return (
    <p className="error-message">No products found matching these filters.</p>
  )
  return (
    <>
      <table id="product-table">
        <thead id="product-table-head">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                if (header.column.id === "Language") {
                  return (
                    <th key={header.id}>{header.id}
                      
                    </th>
                  )
                } else if (header.column.id === "Status") {
                  return (
                    <th key={header.id}>{header.id}
                      
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