// Defines all custom fields to extract from Trello cards
export const customFields: { [key: string]: string } = {
    published: "688a48647c40d0183e053280",
    crowdinProj: "694efa16d67cda3bf9fabdab",
    crowdinFile: "694ef9fdf5bf21eada294ef4",
    exclude: "69ef857e7b87bddeafa48757"
}

// Defines all valid product codes
export const productCodes: string[] = [
    'ANN',
    'BCC',
    'BS',
    'CWL',
    'KOD',
    'LIT',
    'LIT-S',
    'LSS',
    'MB',
    'PN',
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
export const mediaGroups: { [key: string]: string[] } = {
    literature: ['CWL', 'LIT', 'LIT-S'],
    interpretation: ['ANN', 'BS', 'SER', 'SMT'],
    website: ['LIT-S', 'PT', 'TB', 'MB', 'KOD', 'POD'],
    audio_video: ['KOD', 'TW', 'POD', 'PTVID', 'WW', 'OTHER'],
    pcgChurch: ['PCG.CHURCH'],
    //DEPRECATED: magazines: ['Royal Vision', 'Let the Stones Speak', 'The Philadelphia Trumpet']
}

// Abstraction to display UI-friendly product group names
export const groupDisplayNames: { [key: string]: string } = {
    literature: "Literature",
    interpretation: "Interpretation",
    website: "Website",
    audio_video: "Audio/Video",
    pcgChurch: "PCG.church",
    magazines: "Magazines"
}

/*
 * List of supported languages in user-friendly format.
 * Where necessary an ISO-639-1 code can be obtained 
 * by using the ISO6391 library.
*/ 
export const supportedLanguages: string[] = [
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

/*Supported target languges
* ISO-639-1 format
*/

// Abstraction for product fields display in UI
export const friendlyFieldNames: { [key: string]: string } = {
    title: "Title",
    productCode: "Product Code",
    targetLanguage: "Target Language",
    mediaType: "Media Type",
    wordCount: "Word Count",
    datePublished: "Date Published",
    dateArchived: "Date Archived",
    editorUrl: "Editor URL",
    articleUrl: "Article URL"
}