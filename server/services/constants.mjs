export const customFields = {
    published: "688a48647c40d0183e053280",
    crowdinProj: "694efa16d67cda3bf9fabdab",
    crowdinFile: "694ef9fdf5bf21eada294ef4",
}

export const productCodes = [
    'ANN',
    'BCC',
    'BS',
    'CWL',
    'KOD',
    'LIT',
    'LIT-S',
    'LSS',
    'MB',
    'POD',
    'PT',
    'PTVID',
    'RV',
    'SER',
    'SMT',
    'TB',
    'TW'
]

/*
TODO: merge productGroups and labelGroups
*/
// Grouping of product codes extracted via regex from card titles, associated with searchable keys
export const productGroups = {
    literature: ['CWL', 'LIT', 'LIT-S'],
    interpretation: ['ANN', 'BS', 'SER', 'SMT'],
    website: ['LIT-S', 'PT', 'TB', 'MB', 'KOD', 'POD'],
    audio_video: ['KOD', 'TW', 'POD', 'PTVID', 'WW', 'OTHER']
}

// Labels extracted from card titles, associated with searchable keys
export const labelGroups = {
    pcgChurch: ['PCG.CHURCH'],
    magazines: ['Royal Vision', 'Let the Stones Speak', 'The Philadelphia Trumpet']
}

// Abstraction to display UI-friendly product group names
export const groupDisplayNames = {
    literature: "Literature",
    interpretation: "Interpretation",
    website: "Website",
    audio_video: "Audio/Video",
    pcgChurch: "PCOG.church",
    magazines: "Magazines"
}


export const trelloLangIds = {
    French: "65a69ef7128bbe9b3123689c",
    German: "65a69f0bd7a48a7be8f06855",
    Spanish: "545bcbf174d650d56706a84b",
    Portuguese: "65fde7c2fc62ec46d36d5d1e",
    Dutch: "6602d06bb42a2329238c5e84",
    Italian: "668ea91e9d95af525d18f039",
    Afrikaans: "683a2a5fcfd62b060f622aba",
    Finnish: "675064f4fc67adcbbdfc2e47",
    Hebrew: "683a26393a0502e6f5dc33d6"
};


export const languageCodes = {
    'FR': 'French',
    'DE': 'German',
    'ES': 'Spanish',
    'PT': 'Portuguese',
    'NL': 'Dutch',
    'IT': 'Italian',
    'AF': 'Afrikaans',
    'FI': 'Finnish',
    'HE': 'Hebrew'
}

export const friendlyLanguages = [
    'French',
    'German',
    'Spanish',
    'Portuguese',
    'Dutch',
    'Italian',
    'Afrikaans',
    'Finnish',
    'Hebrew',
]

export const friendlyFieldNames = {
    title: "Title",
    productCode: "Product Code",
    targetLang: "Target Language",
    mediaType: "Media Type",
    wordCount: "Word Count",
    datePublished: "Date Published",
    dateArchived: "Date Archived"
}