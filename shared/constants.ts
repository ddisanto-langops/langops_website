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
    'LT',
    'MB',
    'OTHER',
    'PCD',
    'PN',
    'POD',
    'PT',
    'PTVID',
    'RV',
    'SER',
    'SMT',
    'TB',
    'TE',
    'TW'
]

/*
mediaGroups defines which product codes (extracted from card title).
The associated key will be added to 'mediaType' in the API's response.
Note that one product code can belong to multiple groups.
*/
export const mediaGroups: { [key: string]: string[] } = {
    literature: ['CWL', 'LIT'],
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

export const crowdinProjectIds: { [key: string]: string } = {
    'test project (general)': '678338',
    newses: '680076',
    religiones: '680078',
    archaeologyes: '680080',
    newsfr: '680084',
    religionfr: '680086',
    archaeologyfr: '680088',
    newsde: '680090',
    religionde: '680092',
    archaeologyde: '680094',
    youthes: '680096',
    'test project (patrick)': '688783',
    archaeologyaf: '693487',
    archaeologyit: '693489',
    archaeologynl: '693491',
    archaeologyno: '693495',
    archaeologyfi: '693497',
    archaeologypt: '693499',
    archaeologyhe: '693501',
    youthaf: '693505',
    youthfr: '693509',
    youthit: '693511',
    youthnl: '693513',
    youthno: '693515',
    youthfi: '693519',
    youthpt: '693521',
    youthhe: '693523',
    newsaf: '693525',
    newsit: '693527',
    newsnl: '693529',
    newsno: '693531',
    newsfi: '693533',
    newspt: '693535',
    newshe: '693537',
    religionaf: '693539',
    religionit: '693541',
    religionnl: '693545',
    religionno: '693547',
    religionfi: '693549',
    religionpt: '693551',
    religionhe: '693553',
    youthde: '693565',
    'archaeologyhe-en': '725173',
    'fot 2025': '823618'
}
