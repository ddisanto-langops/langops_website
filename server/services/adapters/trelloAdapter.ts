import ISO6391 from "iso-639-1"
import type { RawTrelloCard, TrelloDataSchema } from "../../../shared/types.js";
import { productCodes } from "../../../shared/constants.js";
import { getlocalizedTitle } from "../trelloFunctions.js";



export class TrelloAdapter {

    protected rawData: RawTrelloCard

    private static trelloBoardId = process.env.TrelloBoardId;
    private static trelloKey = process.env.TrelloKey;
    private static trelloToken = process.env.TrelloToken;

    private static wordcountPattern = /(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)/
    private static productCodePattern = /^([A-Z-]*)([0-9]*[A-Z]*)(?=_)/
    private static magazinePattern = /^[A-Z]{2}([0-9]{6})_([A-Z]{2}-[A-Z]{2}$)/
    private static targetLangPattern = /[A-Z]{2}$/
    private static editorPattern = /\/editor\/articles\/posts/
    private static articlePattern = /(?<!editor)\/articles\/posts/
    private static crowdinLinkPattern = /editor\/([A-z]{4,})\/([0-9]{5})/
    private static youTubeLinkPattern = /youtube/


    constructor(data: RawTrelloCard) {
        if (!TrelloAdapter.trelloBoardId || !TrelloAdapter.trelloKey || !TrelloAdapter.trelloToken ) {
            throw new Error("Unable to init card class: One or more missing API credentials")
        }
        this.rawData = data
    }


    get isTemplate() {
        return Boolean(this.rawData.isTemplate)
    }

    get id() {
        return this.rawData.id
    }

    get title() {
        return this.rawData.name
    }

    get dueDate() {
        const dueDate = this.rawData.due ? this.rawData.due : null
        return dueDate
    }

    get dateLastActivity() {
        return this.rawData.dateLastActivity
    }

    get productCode() {
        const productCodeMatch = this.title.match(TrelloAdapter.productCodePattern)

        if (productCodeMatch && productCodes.includes(productCodeMatch[1])) {
            const productCode = productCodeMatch[1]
            return productCode
        } else if (productCodeMatch && !productCodes.includes(productCodeMatch[1])) {
            return "INVALID"
        } else if (!productCodeMatch) {
            return "MISSING"
        } else {
            return "ERROR"
        }
    }

    get targetLanguage() {
        const targetLangMatch = this.title.match(TrelloAdapter.targetLangPattern)

        if (targetLangMatch) {
            const code = targetLangMatch[0].toLowerCase()
            const friendlyName = ISO6391.getName(code)
            return friendlyName
        } else {
            return "ERROR"
        } 
    }

    get trelloUrl() {
        return this.rawData.url
    }

    get wordCount() {
        const wordCountMatch = this.title.match(TrelloAdapter.wordcountPattern)
        const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : 0
        return wordCount
    }

    get labels() {
        return this.rawData.labels 
    }

    private async getLocalizedTitle() {
        const url = this.getUrls().articleUrl
        if (url) {
            const title = await getlocalizedTitle(url)
            return title
        }
        return null
    }

    protected getUrls() {
        const cardAttachments = this.rawData.attachments ?? null
        let editorUrl = null, articleUrl = null, crowdinUrl = null, youTubeUrl = null
        for (const attachment of cardAttachments ?? []) {
            const url = attachment.url
            const editorMatch = url.match(TrelloAdapter.editorPattern)
            const articleMatch = url.match(TrelloAdapter.articlePattern)
            const crowdinMatch = url.match(TrelloAdapter.crowdinLinkPattern)
            const youTubeMatch = url.match(TrelloAdapter.youTubeLinkPattern)

            if (editorMatch) {
                editorUrl = url
            } else if (articleMatch) {
                articleUrl = url
            } else if (crowdinMatch) {
                crowdinUrl = url
            } else if (youTubeMatch) {
                youTubeUrl = url
            }
        }
        return {
            crowdinUrl: crowdinUrl,
            editorUrl: editorUrl,
            articleUrl: articleUrl,
            youTubeUrl: youTubeUrl
        }
    }

    get datePublished() {
        const cardActions = this.rawData.actions; // No need for ?? null
        if (!cardActions) return null;

        for (const item of cardActions) {
            const isCheckItemUpdate = item.type === 'updateCheckItemStateOnCard';
            const isPublishedFlag = item.data?.checkItem?.name?.toLowerCase().includes('[published]');
            const isComplete = item.data?.checkItem?.state === 'complete';

            if (isCheckItemUpdate && isPublishedFlag && isComplete) {
                return item.date; // Returns the string date
            }
        }
        return null;
    }

    get dateArchived() {
        const dateArchived = this.rawData.dateClosed ? this.rawData.dateClosed : '';
        return dateArchived
    }

    get isMagazine () {
        const magazineMatch = this.title.match(TrelloAdapter.magazinePattern)
        const magazine = magazineMatch ? magazineMatch[1] : null
        if (magazine) {
            return true
        }
        return false
    }


    protected assignMediaGroups() {
        /**
         * Assigns one or more media groups.
         * For source of truth, see productCodes array found in constants.
         * @return {string[]} mediaGroups - the complete array of assigned media groups.
        */

        const mediaGroups = []
        
        switch (this.productCode) {
            // handle simple cases first
            case "AD":
                mediaGroups.push("audio_video")
                break
            case "ANN":
                mediaGroups.push("interpretation")
                break
            case "BCC":
                mediaGroups.push("literature")
                break
            case "BS":
                mediaGroups.push("interpretation")
                break
            case "CWL":
                mediaGroups.push("literature")
                break
            case "LIT":
                mediaGroups.push("literature")
                break
            case "LIT-S":
                mediaGroups.push("website")
                break
            case "LT":
                mediaGroups.push("audio_video", "website")
                break
            case "MB":
                mediaGroups.push("website")
                break
            case "PCD":
                mediaGroups.push("other")
                break
            case "PN":
                mediaGroups.push("emails")
                break
            case "SER":
                mediaGroups.push("interpretation")
                break
            case "SMT":
                mediaGroups.push("interpretation")
                break
            case "TB":
                mediaGroups.push("website")
                break
            case "TE":
                mediaGroups.push("website")
                break

            // evaluate complex products
            case "KOD": {
                const articleUrl = this.getUrls().articleUrl
                if (articleUrl) {
                    mediaGroups.push("audio_video", "website")
                } else {
                    mediaGroups.push("audio_video")
                }
                break
            }
            
            case "LSS": {
                const magazine = this.isMagazine
                magazine ? mediaGroups.push("magazines") : mediaGroups.push("website")
                break
            }
            
            case "OTHER": {
                const urls = this.getUrls()
                
                if (urls.youTubeUrl) {
                    mediaGroups.push("audio_video")
                } else {
                    mediaGroups.push("other")
                }
                break
            }
            
            case "POD": {
                const articleUrl = this.getUrls().articleUrl
                const youTubeUrl = this.getUrls().youTubeUrl
                if (articleUrl || youTubeUrl) {
                    mediaGroups.push("audio_video", "website")
                } else {
                    mediaGroups.push("audio_video")
                }
                break
            }

            case "PT": {
                const magazine = this.isMagazine
                magazine ? mediaGroups.push("magazines") : mediaGroups.push("website")
                break
            }

            case "PTVID": {
                const articleUrl = this.getUrls().articleUrl
                const youTubeUrl = this.getUrls().youTubeUrl
                if (articleUrl || youTubeUrl) {
                    mediaGroups.push("audio_video", "website")
                } else {
                    mediaGroups.push("audio_video")
                }
                break
            }

            case "RV": {
                const magazine = this.isMagazine
                magazine ? mediaGroups.push("magazines") : mediaGroups.push("website") 
                break
            }
            
        }
        return mediaGroups
    }

    async getActiveCards(since?: string): Promise<RawTrelloCard[]> {
        
        const date = new Date();
        date.setDate(date.getDate() -1)
        const yesterday = date.toISOString().split('T')[0]
    
        try {
            const response = await fetch(
                `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
                { method: 'GET' }
            )
            if (!response.ok) {
                throw new Error(`Trello API error: ${response.statusText}`)
            }
            const cards: RawTrelloCard[] = await response.json() as RawTrelloCard[]
            return cards
        } catch (error) {
            error instanceof Error ? console.log(`Get Active Cards: ${error.message}`) : 
                console.log("Get Active Cards: Unkown error")
            return []
        }
    }


    async parseTrelloData(): Promise<TrelloDataSchema> {
        const urls = this.getUrls()
        const trelloData = {
            id: this.id,
            url: this.trelloUrl,
            title: this.title,
            localizedTitle: await this.getLocalizedTitle(),
            productCode: this.productCode,
            targetLanguage: this.targetLanguage,
            dueDate: this.dueDate,
            datePublished: this.datePublished,
            dateLastActivity: this.dateLastActivity,
            dateArchived: this.dateArchived,
            mediaGroups: this.assignMediaGroups(),
            editorUrl: urls.editorUrl,
            articleUrl: urls.articleUrl,
            wordCount: this.wordCount
        }

        return trelloData
    }
    
    
}