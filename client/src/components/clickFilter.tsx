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
    selectedGroups: string[]
    onSelectionChange: (groups: string[]) => void
}

export function ClickFilter({ selectedGroups, onSelectionChange }: ClickFilterProps) {
    const toggle = (value: string) => {
        if (selectedGroups.includes(value)) {
            onSelectionChange(selectedGroups.filter(g => g !== value))
        } else {
            onSelectionChange([...selectedGroups, value])
        }
    }

    return (
        <div id="click-filter">
            <button
                className={selectedGroups.length === 0 ? "click-filter-button-selected" : "click-filter-button"}
                onClick={() => onSelectionChange([])}
            >All</button>
            {GROUPS.map(({ value, label }) => (
                <button
                    key={value}
                    className={selectedGroups.includes(value) ? "click-filter-button-selected" : "click-filter-button"}
                    onClick={() => toggle(value)}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}