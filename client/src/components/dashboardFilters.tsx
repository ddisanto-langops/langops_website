import {
  productCodeEnum, 
  supportedLanguageEnum, 
  groupDisplayNames, 
  ProductMetaFilters
} from "@langops-website/shared"
import { customStylesMulti } from "./styles/dropdownMulti"
import ISO6391 from "iso-639-1"
import React, { useState } from "react"
import Select, { MultiValue } from "react-select"


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

  const handleLanguageSelect = (choice: MultiValue<{value: string, label: string}>) => {
      const languages = []
      for (const item of choice.values()) {
        languages.push(item.value)
      }
      onFilterChange({...filters, targetLanguages: languages})
  }

  const handleCodeSelect = (choice: MultiValue<{value: string, label: string}>) => {
    const codes = []
      for (const item of choice.values()) {
        codes.push(item.value.toUpperCase())
      }
      onFilterChange({...filters, productCodes: codes})
  }
  
  return (
    
    <>
    <Select
      isMulti
      isClearable
      isSearchable
      placeholder={"Language..."}
      styles={customStylesMulti}
      value={(filters.targetLanguages || []).map((code) => ({
        value: code,
        label: ISO6391.getName(code) || code
      }))}
      options={supportedLanguageEnum.map((lang) => ({ value: ISO6391.getCode(lang), label: lang}))}
      onChange={handleLanguageSelect}

    />
    <Select
      isMulti
      isClearable
      isSearchable
      placeholder={"Product Code..."}
      styles={customStylesMulti}
      value={(filters.productCodes || []).map((code) => ({
        value: code.toLowerCase(),
        label: code
      }))}
      options={productCodeEnum.map((code) => ({ value: code.toLowerCase(), label: code}))}
      onChange={handleCodeSelect}

    />
    <div className="date-picker-div">
      <label>From: 
        <input 
          className="date-picker"
          type="date"
          id="from"
          name="filter-start"
          defaultValue={filters.dateFrom}
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
          defaultValue={filters.dateTo}
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