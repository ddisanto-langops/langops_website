import type { ArchivedProduct } from "../../../shared/types";

import { queryAllCompletions } from "../../services/api"
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
import { groupDisplayNames } from "../../../shared/constants"
import { EditModal } from "./CompletionModal";

const columnHelper = createColumnHelper<ArchivedProduct>()

const columns = [
  columnHelper.accessor('title', {
    header: 'Title',
  }),
  columnHelper.accessor('productCode', {
    header: 'Product Code',
  }),
  columnHelper.accessor('targetLanguage', {
    header: 'Language',
  }),
  columnHelper.accessor('mediaGroups', {
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

export function CompletionTable() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })
  const [sorting, setSorting] = useState([{ id: 'datePublished', desc: true }])
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const [titleInput, setTitleInput] = useState('')
  const [codeInput, setCodeInput] = useState('')
  const [langInput, setLangInput] = useState('')
  const [debouncedTextFilters, setDebouncedTextFilters] = useState({ title: '', code: '', lang: '' })
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [selectedRow, setSelectedRow] = useState<ArchivedProduct | null>(null)
  const [modalIsOpen, setModalIsOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTextFilters({ title: titleInput, code: codeInput, lang: langInput })
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [titleInput, codeInput, langInput])

  const normalizedTextFilters = {
    title: debouncedTextFilters.title.trim(),
    code: debouncedTextFilters.code.trim(),
    lang: debouncedTextFilters.lang.trim(),
  }

  const sortState = sorting[0]
  const queryFilters = {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    title: normalizedTextFilters.title || undefined,
    code: normalizedTextFilters.code || undefined,
    lang: normalizedTextFilters.lang || undefined,
    group: groupFilter || undefined,
    sortBy: sortState?.id,
    sortDir: sortState?.desc === false ? 'asc' : 'desc',
  }

  const { data: response = { data: [], totalCount: 0 }, isLoading, isError } = useQuery({
    queryKey: ['completions', queryFilters],
    queryFn: () => queryAllCompletions(queryFilters),
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

  const handleTabClick = (value: string | null) => {
    setActiveTab(value)
    setGroupFilter(value ? value : null)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const filterInputs: Record<string, [string, React.Dispatch<React.SetStateAction<string>>]> = {
    title: [titleInput, setTitleInput],
    productCode: [codeInput, setCodeInput],
    targetLanguage: [langInput, setLangInput],
  }

  const handleRowClick = (row: ArchivedProduct) => {
    setSelectedRow(row)
    setModalIsOpen(true)
  }

  const onModalClose = () => {
    setModalIsOpen(false)
  }

  const GuardedCompletionModal = () => {
    if (!selectedRow) return null
    return (
      <EditModal record={selectedRow} isOpen={modalIsOpen} onClose={onModalClose}/>
    )
  }

  if (isLoading && data.length === 0) return <p>Loading...</p>
  if (isError) return <p>Error loading completions.</p>

  return (
    <>
      <GuardedCompletionModal  />
      <h2 id='completions-page-title'>Completions</h2>
      <ClickFilter activeTab={activeTab} onTabClick={handleTabClick}/>
      <div className="pagination-controls">
        <button className="pagination-button" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          Previous
        </button>
        <span>Page {pagination.pageIndex + 1} of {pageCount}</span>
        <span>({totalCount} records)</span>
        <button className="pagination-button" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next
        </button>
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
                        {{ asc: ' ↑', desc: ' ↓' }[header.column.getIsSorted() as 'asc' | 'desc'] ?? null}
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
                onClick={() => handleRowClick(row.original)}
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
