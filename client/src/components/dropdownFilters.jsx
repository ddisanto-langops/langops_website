export function DropdownFilters({filters, onFilterChange}) {
    return (

    <select
    id="dashboard-lang-select"
      value={filters.lang ?? ''}
      onChange={e => onFilterChange({
        ...filters,
        lang: e.target.value || null
      })}
    >
      <option value="">All Languages</option>
      <option value="Spanish">Spanish</option>
      <option value="French">French</option>
      <option value="German">German</option>
      <option value="Portuguese">Portuguese</option>
      <option value="Dutch">Dutch</option>
      <option value="Italian">Italian</option>
      <option value="Afrikaans">Afrikaans</option>
      <option value="Finnish">Finnish</option>
      <option value="Hebrew">Hebrew</option>
    </select>

  )
}