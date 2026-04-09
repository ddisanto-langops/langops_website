// Defines all custom fields to extract from Trello cards
export const customFields = {
    published: "688a48647c40d0183e053280",
    crowdinProj: "694efa16d67cda3bf9fabdab",
    crowdinFile: "694ef9fdf5bf21eada294ef4",
}

// Defines all valid product codes
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
mediaGroups defines which product codes (extracted from card title) 
and labels (extracted from card idLabels field) belong to which group(s).
The associated key will be added to 'mediaType' in the API's response.
Note that one product code can belong to multiple groups.
*/
export const mediaGroups = {
    literature: ['CWL', 'LIT', 'LIT-S'],
    interpretation: ['ANN', 'BS', 'SER', 'SMT'],
    website: ['LIT-S', 'PT', 'TB', 'MB', 'KOD', 'POD'],
    audio_video: ['KOD', 'TW', 'POD', 'PTVID', 'WW', 'OTHER'],
    pcgChurch: ['PCG.CHURCH'],
    magazines: ['Royal Vision', 'Let the Stones Speak', 'The Philadelphia Trumpet']
}

// Abstraction to display UI-friendly product group names
export const groupDisplayNames = {
    literature: "Literature",
    interpretation: "Interpretation",
    website: "Website",
    audio_video: "Audio/Video",
    pcgChurch: "PCG.church",
    magazines: "Magazines"
}

/*
On a Trello card, all IDs are stored in an array.
The language of the card will be determined by this ID,
regardless of what the title may or may not contain.
*/
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

// Abstraction for language display in UI
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

// Abstraction for product fields display in UI
export const friendlyFieldNames = {
    title: "Title",
    productCode: "Product Code",
    targetLang: "Target Language",
    mediaType: "Media Type",
    wordCount: "Word Count",
    datePublished: "Date Published",
    dateArchived: "Date Archived"
}