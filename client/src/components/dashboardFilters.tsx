import { productCodeEnum, supportedLanguageEnum, groupDisplayNames } from "../../../shared/enums"
import type { ProductMetaFilters } from "../../../shared/types"
import ISO6391 from "iso-639-1"
import React, { useState } from "react"


interface DashboardFilterProps {
  filters: ProductMetaFilters
  onFilterChange: CallableFunction
}

export function DashboardFilter({filters, onFilterChange}: DashboardFilterProps) {
  const [mediaGroups, setMediaGroups] = useState<string[] | undefined>()

  const handleMediaGroups = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === 'all') {
      const newMediaGroups = undefined
      setMediaGroups(newMediaGroups)
      onFilterChange({...filters, mediaGroups: newMediaGroups})
    } else {
      const groups = mediaGroups || []
      const alreadySelected = groups.includes(value)
      const newMediaGroups = alreadySelected ? groups?.filter((item) => item !== value) : [...groups, value]
      setMediaGroups(newMediaGroups)
      onFilterChange({...filters, mediaGroups: newMediaGroups})
    }
  }
  
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
        <option key={option} value={ISO6391.getCode(option)}>{option}</option>
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
          value={filters.dateTo ? filters.dateTo.split('T')[0] : undefined}
          onChange={e => onFilterChange({
            ...filters,
            dateTo: e.target.value || null
          })}
        />
      </label>
    </div>
    <div id="dashboard-media-groups">
      <label className={mediaGroups?.length === 0 || mediaGroups === undefined ? "dashboard-mediaGroup-label-selected" : "dashboard-mediaGroup-label"}>All
        <input
              className="dashboard-mediaGroup-checkbox"
              type="checkbox"
              key="all"
              value="all"
              onChange={e => handleMediaGroups(e)}
            >
          </input>
        </label>
      {Object.entries(groupDisplayNames).map(([key, value]) => (
        
        <label className={mediaGroups?.includes(key) ? "dashboard-mediaGroup-label-selected" : "dashboard-mediaGroup-label"}>{value}
        <input
            className="dashboard-mediaGroup-checkbox"
            multiple={true}
            type="checkbox"
            key={key}
            value={key}
            onChange={e => handleMediaGroups(e)}
          >
          
        </input>
        </label>
      ))}
    </div>
    </>
  )
}