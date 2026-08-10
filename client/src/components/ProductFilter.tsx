import { useState, KeyboardEvent } from "react";
import { GetProductFilters } from "@langops-website/shared"
import Select, { MultiValue } from "react-select"
import { customStylesMulti } from "./styles/dropdownMulti";
import ISO6391 from "iso-639-1"
import { supportedLanguageEnum, statusEnum } from "@langops-website/shared";

const GROUPS = [
    { value: 'audio_video',    label: 'Audio/Video' },
    { value: 'literature',     label: 'Literature' },
    { value: 'website',        label: 'Website' },
    { value: 'interpretation', label: 'Interpretation' },
    { value: 'magazines',      label: 'Magazines' },
    { value: 'emails',         label: 'Emails' },
    { value: 'other',          label: 'Other' },
]


interface ClickFilterProps {
    filters: GetProductFilters
    defaultFilters: GetProductFilters
    setFilters: (filters: GetProductFilters) => void
}

export function ProductFilter({ filters, defaultFilters, setFilters }: ClickFilterProps) {
    const [lang, setLang] = useState<string[] | undefined>()
    const [dateFrom, setDateFrom] = useState<string | undefined>()
    const [dateTo, setDateTo] = useState<string | undefined>()
    const [mediaGroups, setMediaGroups] = useState<string[] | undefined>()
    const [search, setSearch] = useState<string | undefined>()
    const [status, setStatus] = useState<string[] | undefined>()
    const [limit, setLimit] = useState<number>()

    const handleApply = () => {
        setFilters({
            targetLanguages: lang,
            dateFrom: dateFrom,
            dateTo: dateTo,
            mediaGroups: mediaGroups,
            search: search,
            status: status,
            limit: limit
        })
    }

    const handleFilterClear = () => {
        setFilters(defaultFilters)
        setLang(undefined)
        setDateFrom(undefined)
        setDateTo(undefined)
        setMediaGroups(undefined)
        setSearch(undefined)
        setStatus(undefined)
        setLimit(50)
    }

    const toggleMediaGroups = (value: string) => {
        if (!mediaGroups) setMediaGroups([value])
        if (mediaGroups?.includes(value)) {
            setMediaGroups(mediaGroups.filter(g => g !== value))
        } else if (mediaGroups && !mediaGroups?.includes(value)) {
            setMediaGroups([...mediaGroups, value])
        }
    }

    const handleTableLimit = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        setLimit(Number(value))
    }
    
    const handleLanguageSelect = (choice: MultiValue<{value: string, label: string}>) => {
        const languages = choice.map(item => item.value)
        setLang(languages)
    }

    const handleStatusSelect = (choice: MultiValue<{value: string, label: string}>) => {
        const statuses = choice.map(item => item.value)
        setStatus(statuses)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleApply()
        }
    }

    return (
        <div id="product-filter">
            <div className="media-groups-div">
                <button
                    className={!mediaGroups || mediaGroups.length === 0 ? "interactive-button-selected" : "interactive-button"}
                    onClick={() => toggleMediaGroups("")}
                >All</button>
                {GROUPS.map(({ value, label }) => (
                    <button
                        key={value}
                        className={mediaGroups && mediaGroups.includes(value) ? "interactive-button-selected" : "interactive-button"}
                        onClick={() => toggleMediaGroups(value)}
                    >
                    {label}
                    </button>
                ))}
            </div>
            <div className="product-filter-dropdown-div">
                <div className="date-picker-div" id="product-filter-date-picker">
                    <label htmlFor="date-picker-from">From: </label>
                    <input id="date-picker-from" type="date" className="date-picker" value={filters.dateFrom} onChange={e => setDateFrom(e.target.value)} />
                </div>
                <div className="date-picker-div" id="product-filter-date-picker">
                    <label htmlFor="date-picker-to">To: </label>
                    <input id="date-picker-to" type="date" className="date-picker" value={filters.dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>               
                <label>
                    <Select
                        className="product-filter-dropdown"
                        isMulti
                        isClearable
                        isSearchable
                        placeholder="Filter by language..."
                        styles={customStylesMulti}
                        value={(lang || []).map((code) => ({
                            value: code,
                            label: ISO6391.getName(code) || code
                        }))}
                        options={supportedLanguageEnum.map((lang) => ({ value: ISO6391.getCode(lang), label: lang}))
                            .sort((a, b) => a.label.localeCompare(b.label))
                        }
                        onChange={handleLanguageSelect}                          
                    />
                </label>
                <label>
                    <Select
                        className="product-filter-dropdown"
                        isMulti
                        isClearable
                        isSearchable
                        placeholder="Filter by status..."
                        styles={customStylesMulti}
                        value={(status || []).map((code) => (
                            {value: code.toLowerCase(), label: code}
                        ))}
                        options={statusEnum.map((code) => (
                            {value: code.toLowerCase(), label: code}
                            ))
                            .sort((a, b) => a.label.localeCompare(b.label))
                        }
                        onChange={handleStatusSelect}
                        />
                </label>
            </div>
            <div className="search-input-div">
                Title/Localized Title:
                <input
                    id="product-filter-input"
                    type="text"
                    placeholder="Search title or localized title..."
                    value={search || ""}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className="pagination-div">
                <label>Products to display: 
                    <select className="pagination-select" value={limit} defaultValue={50} onChange={(e) => setLimit(Number(e.target.value))}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={200}>200</option>
                        <option value={300}>300</option>
                        <option value={400}>400</option>
                        <option value={500}>500</option>
                    </select>
                </label>
            </div>
            <div className="product-filter-button-div">
                <button
                    className="interactive-button"
                    style={{cursor: 'pointer'}}
                    onClick={handleApply}
                >
                    Apply
                </button>
                <button 
                    className="interactive-button"
                    style={{cursor: 'pointer'}}
                    type="submit" onClick={handleFilterClear}
                >
                    Clear
                </button>
            </div>
        </div>
    )
}