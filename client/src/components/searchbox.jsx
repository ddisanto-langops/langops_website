export function SearchBox({category, setCategory, query, setQuery}) {
    return (
        <div>
            <select
                id='main-dropdown' 
                value={category}
                onChange={e => setCategory(e.target.value)}
            >
                <option value={'title'}>Title</option>
                <option value={'targetLang'}>Target Language</option>
                <option value={'productStatus'}>Status</option>
                <option value={'due'}>Due</option>
            </select>
            <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
            />
        </div>
    )
}