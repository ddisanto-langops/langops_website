// Defines all custom fields to extract from Trello cards
export const customFieldEnum = {
    published: "688a48647c40d0183e053280",
    crowdinProj: "694efa16d67cda3bf9fabdab",
    crowdinFile: "694ef9fdf5bf21eada294ef4",
    exclude: "69ef857e7b87bddeafa48757"
}


export const statusEnum = [
    "Archived",
    "Published",
    "Pending",
    "Deleted",
    "Unknown"
]

export const productCodeEnum: string[] = [
    /*
     * productCodes is an Alphabetized array defining all valid product codes,
     * which also acts as a source of truth for conditions
     * governing media group assignment via the assignMediaGroups function
     * found in the BaseCard class.
     * TODO: implement assignMediaGroups
    */ 

    'AD',       // always audio_video
    'ANN',      // always interpretation
    'BCC',      // always literature
    'BS',       // always interpretation
    'CWL',      // always literature
    /**
     * KOD: if has article URL, classify as website as well as audio_video.
     * If no article URL, classify as audio_video only.
    */
    'KOD',
    'LIT',      // always literature
    'LIT-S',    // website only, never literature
    'LSS',      // magazine if has edition code; else website
    'LT',       // always audio_video AND website
    'MB',       // website only
    /**
     * OTHER: can be text or audio. If has duration, classify as audio_video.
     * Else, classify as emails. 
     */
    'OTHER',
    'PCD',      // other only
    'PN',       // emails only
    'POD',      // always audio_video; also website if has URL
    'PT',       // magazine if has edition code; else website
    'PTVID',    // always audio_video; also website if has URL
    'RV',       // magazine if has edition code; else website
    'SER',      // always interpretation
    'SMT',      // always interpretation
    'TB',       // always website
    'TE',       // always website
    'TW'        // always audio_video; also website if has URL
]

/*
mediaGroups defines which product codes (extracted from card title).
The associated key will be added to 'mediaType' in the API's response.
Note that one product code can belong to multiple groups.
*/
export const mediaGroups: { [key: string]: string[] } = {
    literature: ['CWL', 'LIT', 'BCC'],
    interpretation: ['ANN', 'BS', 'SER', 'SMT'],
    website: ['LIT-S', 'PT', 'TB', 'MB', 'KOD', 'POD'],
    audio_video: ['AD', 'KOD', 'TW', 'POD', 'PTVID', 'WW', 'OTHER'],
    pcgChurch: ['PCG.CHURCH'],
    emails: ['PN'],
    magazines: ['RV', 'LSS', 'PT'],
    other: ['PCD']
}

// Abstraction to display UI-friendly product group names
export const groupDisplayNames: { [key: string]: string } = {
    literature: "Literature",
    interpretation: "Interpretation",
    website: "Website",
    audio_video: "Audio/Video",
    pcgChurch: "PCG.church",
    magazines: "Magazines",
    emails: "Emails",
    other: "Other"
}

/*
 * List of supported languages in user-friendly format.
 * Where necessary an ISO-639-1 code can be obtained 
 * by using the ISO6391 library.
*/ 
export const supportedLanguageEnum = [
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
