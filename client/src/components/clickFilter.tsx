import { mediaGroups } from "../../../shared/constants"

interface ClickFilterProps {
    activeTab: string | null
    onTabClick: (mediaGroups: string | null) => void
}

export function ClickFilter({ onTabClick, activeTab }: ClickFilterProps) {
    return (
        <div id="click-filter">
            <button className={activeTab === null ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick(null)}>All</button>
            <button className={activeTab === 'audio_video' ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick('audio_video')}>Audio/Video</button>
            <button className={activeTab === 'literature' ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick('literature')}>Literature</button>
            <button className={activeTab === 'website' ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick('website')}>Website</button>
            <button className={activeTab === 'interpretation' ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick('interpretation')}>Interpretation</button>
            <button className={activeTab === 'pcgChurch' ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick('pcgChurch')}>PCG.church</button>
            <button className={activeTab === 'magazine' ? "click-filter-button-selected" : "click-filter-button"} onClick={() => onTabClick('magazine')}>Magazines</button>
        </div>
    )
}