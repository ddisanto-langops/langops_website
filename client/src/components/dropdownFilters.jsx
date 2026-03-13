import { productCodes, friendlyLanguages, groupDisplayNames } from "../../../server/services/constants.mjs"

export function DropdownFilters({filters, onFilterChange}) {
    return (
    
    <>
    <select
    id="dashboard-lang-select"
    className="dashboard-dropdown"
      value={filters.lang ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        lang: e.target.value || null
      })}
    >
      <option value="">All Languages</option>
      {friendlyLanguages.map((option) => (
        <option value={option}>{option}</option>
      ))}
    </select>
    <select
      id="dashboard-group-select"
      className="dashboard-dropdown"
      value={filters.group ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        group: e.target.value || null
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
      value={filters.code ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        code: e.target.value || null
      })}
    >
      <option value="">All Codes</option>
      {productCodes.map((code) => (
        <option value={code}>{code}</option>
      ))}
    </select>
    </>

    // TODO: Add date filters
  )
}