import { fetchAdminCompletions } from "../../services/api"
import { ClickFilter } from "./clickFilter";
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender
} from '@tanstack/react-table'
import { formatDate } from "../../services/formatDate"
import { groupDisplayNames } from "../../../server/services/constants.mjs"

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
      const mediaTypes = info.getValue() ?? []
      return mediaTypes.map((type) => groupDisplayNames[type] || type).join(', ')
    },
    enableSorting: false,
  }),
  columnHelper.accessor('datePublished', {
    header: 'Date Published',
    cell: info => formatDate(info.getValue())
  })
]

const PAGE_SIZE = 50

export function CompletionsTable({ onRowClick }) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })
  const [sorting, setSorting] = useState([{ id: 'datePublished', desc: true }])
  const [groupFilter, setGroupFilter] = useState(null)

  const [titleInput, setTitleInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [langInput, setLangInput] = useState('')
  const [debouncedTextFilters, setDebouncedTextFilters] = useState({ title: '', code: '', lang: '' })

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
    title: debouncedTextFilters.title || undefined,
    code: debouncedTextFilters.code || undefined,
    lang: debouncedTextFilters.lang || undefined,
    group: groupFilter || undefined,
    sortBy: sortState?.id,
    sortDir: sortState?.desc === false ? 'asc' : 'desc',
  }

  const { data: response = { data: [], totalCount: 0 }, isLoading, isError } = useQuery({
    queryKey: ['completions', queryFilters],
    queryFn: () => fetchAdminCompletions(queryFilters),
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

  const handleTabClick = (val) => {
    setGroupFilter(val ? val[0] : null)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const filterInputs = {
    title: [titleInput, setTitleInput],
    productCode: [codeInput, setCodeInput],
    targetLang: [langInput, setLangInput],
  }

  if (isLoading && data.length === 0) return <p>Loading...</p>
  if (isError) return <p>Error loading completions.</p>

  return (
    <>
      <h2 id='completions-page-title'>Completions</h2>
      <ClickFilter onTabClick={handleTabClick}/>
      <div className="pagination-controls">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </button>
        <span>Page {pagination.pageIndex + 1} of {pageCount}</span>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
        <span>({totalCount} total records)</span>
      </div>

      <div style={{ overflow: 'auto', position: 'relative' }}>
        <table id="completions-table" style={{ width: '100%' }}>
          <thead id="completions-table-head">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  const filterEntry = filterInputs[header.column.id]
                  return (
                    <th key={header.id}>
                      <div
                        className="table-sort-div"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted()] ?? null}
                      </div>
                      {filterEntry && (
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

          <tbody id="completions-table-body">
            {table.getRowModel().rows.map(row => (
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
            ))}
          </tbody>
        </table>
      </div>

      
    </>
  )
}
