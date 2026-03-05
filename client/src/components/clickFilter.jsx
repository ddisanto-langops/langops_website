export function ClickFilter({ onTabClick }) {
    return (
        <div id="click-filter">
            <button className="click-filter-button" onClick={() => onTabClick(null)}>All</button>
            <button className="click-filter-button" onClick={() => onTabClick(['audio_video'])}>Audio/Video</button>
            <button className="click-filter-button" onClick={() => onTabClick(['literature'])}>Literature</button>
            <button className="click-filter-button" onClick={() => onTabClick(['website'])}>Website</button>
            <button className="click-filter-button" onClick={() => onTabClick(['interpretation'])}>Interpretation</button>
            <button className="click-filter-button" onClick={() => onTabClick(['pcog.church'])}>PCOG.church</button>
        </div>
    )
}