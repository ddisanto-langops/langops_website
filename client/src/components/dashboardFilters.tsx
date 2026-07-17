import { productCodeEnum, supportedLanguageEnum, groupDisplayNames } from "../../types/enums"
import type { GetProductFilters } from "../../types/types"

interface DashboardFilterProps {
  filters: GetProductFilters
  onFilterChange: CallableFunction
}

export function DashboardFilter({filters, onFilterChange}: DashboardFilterProps) {
    return (
    
    <>
    <select
    id="dashboard-lang-select"
    className="dashboard-dropdown"
      value={filters.targetLanguage ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        lang: e.target.value || null
      })}
    >
      <option value="">All Languages</option>
      {supportedLanguageEnum.map((option) => (
        <option value={option}>{option}</option>
      ))}
    </select>
    <select
      id="dashboard-group-select"
      className="dashboard-dropdown"
      value={filters.mediaGroups ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        group: e.target.value ? [e.target.value] : undefined
      })}
    >
      <option value="">All Media Groups</option>
      {Object.entries(groupDisplayNames).map(([key, value]) => (
        <option value={key}>{value}</option>
      ))}
    </select>
    <select
    id="dashboard-code-select"
    className="dashboard-dropdown"
      value={filters.productCode ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        code: e.target.value || null
      })}
    >
      <option value="">All Codes</option>
      {productCodeEnum.map((code) => (
        <option value={code}>{code}</option>
      ))}
    </select>
    <div className="date-picker-div">
      <label>From: 
        <input 
        className="date-picker"
        type="date"
        id="from"
        name="filter-start"
        value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined}
        onChange={e => onFilterChange({
          ...filters,
          from: e.target.value || null
        })}
        />
      </label>
    </div>
    <div className="date-picker-div">
      <label>To: 
        <input 
        className="date-picker"
        type="date"
        id="to"
        name="filter-end"
        value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : undefined}
        onChange={e => onFilterChange({
          ...filters,
          to: e.target.value || null
        })}
        />
      </label>
    </div>
    </>
  )
}