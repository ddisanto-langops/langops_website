import { productCodeEnum, supportedLanguageEnum, groupDisplayNames } from "../../types/enums"
import type { ProductMetaFilters } from "../../../shared/types"

interface DashboardFilterProps {
  filters: ProductMetaFilters
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
        targetLanguage: e.target.value || null
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
        mediaGroups: e.target.value ? [e.target.value] : undefined
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
        productCode: e.target.value || null
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
        value={filters.dateFrom ? filters.dateFrom.split('T')[0] : undefined}
        onChange={e => onFilterChange({
          ...filters,
          dateFrom: e.target.value || null
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
        value={filters.dateFrom ? filters.dateFrom.split('T')[0] : undefined}
        onChange={e => onFilterChange({
          ...filters,
          dateTo: e.target.value || null
        })}
        />
      </label>
    </div>
    </>
  )
}