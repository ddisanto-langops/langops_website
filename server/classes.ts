import type { BaseProduct, ActiveProduct, ArchivedProduct, RawTrelloCard } from "../shared/types.js"

import { 
    customFields,
    productCodes, 
    mediaGroups,
    crowdinProjectIds,
} from '../shared/constants.js';
import { TranslationStatus } from '@crowdin/crowdin-api-client';
import ISO6391 from "iso-639-1"
import { getlocalizedTitle } from "./services/functions.js";


const groupLookup = new Map();
for (const [groupName, codes] of Object.entries(mediaGroups)) {
    codes.forEach(code => {
        if (!groupLookup.has(code)) {
            groupLookup.set(code, []);
        }
        groupLookup.get(code).push(groupName);
    });
}

export class BaseCard {
    protected rawData: RawTrelloCard

    protected static trelloBoardId = process.env.TrelloBoardId;
    protected static trelloKey = process.env.TrelloKey;
    protected static trelloToken = process.env.TrelloToken;
    protected static crowdinToken = process.env.crowdinToken

    private static _crowdinApi: TranslationStatus | null = null;

    protected static get crowdinApi(): TranslationStatus {
        if (!this._crowdinApi) {
            if (!this.crowdinToken) {
                throw new Error("Crowdin Token is missing! Cannot initialize API.");
            }
            this._crowdinApi = new TranslationStatus({ token: this.crowdinToken });
        }
        return this._crowdinApi;
    }

    constructor(data: RawTrelloCard) {
        if (!BaseCard.trelloBoardId || !BaseCard.trelloKey || !BaseCard.trelloToken || !BaseCard.crowdinToken ) {
            throw new Error("Unable to init card class: One or more missing API credentials")
        }
        this.rawData = data
    }

    static wordcountPattern = /(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)/
    static productCodePattern = /^([A-Z-]*)([0-9]*[A-Z]*)(?=_)/
    static magazinePattern = /^[A-Z]{2}([0-9]{6})_([A-Z]{2}-[A-Z]{2}$)/
    static targetLangPattern = /[A-Z]{2}$/
    static editorPattern = /\/editor\/articles\/posts/
    static articlePattern = /(?<!editor)\/articles\/posts/
    static crowdinPattern = /crowdin/
    static crowdinLinkPattern = /editor\/([A-z]{4,})\/([0-9]{5})/
    static youTubeLinkPattern = /youtube/

    get isTemplate() {
        return Boolean(this.rawData.isTemplate)
    }

    get id() {
        return this.rawData.id
    }

    get title() {
        return this.rawData.name
    }

    get productCode() {
        const productCodeMatch = this.title.match(BaseCard.productCodePattern)

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
        const targetLangMatch = this.title.match(BaseCard.targetLangPattern)

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
        const wordCountMatch = this.title.match(BaseCard.wordcountPattern)
        const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : 0
        return wordCount
    }

    get labels() {
        return this.rawData.labels 
    }

    protected getUrls() {
        const cardAttachments = this.rawData.attachments ?? null
        let editorUrl = null, articleUrl = null, crowdinUrl = null, youTubeUrl = null
        for (const attachment of cardAttachments ?? []) {
            const url = attachment.url
            const editorMatch = url.match(BaseCard.editorPattern)
            const articleMatch = url.match(BaseCard.articlePattern)
            const crowdinMatch = url.match(BaseCard.crowdinPattern)
            const youTubeMatch = url.match(BaseCard.youTubeLinkPattern)

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

    get isMagazine () {
        const magazineMatch = this.title.match(BaseCard.magazinePattern)
        const magazine = magazineMatch ? magazineMatch[1] : null
        if (magazine) {
            return true
        }
        return false
    }

    protected getDuration() {
        //TODO: implement via YouTube API
        return null
    }

    protected assignMediaGroups() {
        /**
         * Called once per product, assigns one or more media groups.
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
                const duration = this.getDuration()
                if (duration) {
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

    public getCustomFields() {
        const cardCustomFields = this.rawData.customFieldItems ?? null
        let published = false, exclude = false
        if (cardCustomFields) {
            for (const field of cardCustomFields) {
                if (field.idCustomField === customFields.published) {
                    published = field.value.checked === "true";
                    }
                    if (field.idCustomField === customFields.exclude) {
                        exclude = field.value.checked === "true";
                    }
                }
        }
        return {
            published: published,
            exclude: exclude
        }
    }

    parseBaseCard() {
        const fields = this.getCustomFields()
        const parsedBaseCard: BaseProduct = {
            id: this.id,
            title: this.title,
            productCode: this.productCode,
            targetLanguage: this.targetLanguage,
            datePublished: this.datePublished,
            mediaGroups: this.assignMediaGroups(),
            published: fields.published,
            exclude: fields.exclude,
            labels: this.labels,
            wordCount: this.wordCount,
            duration: this.getDuration(),
            trelloUrl: this.trelloUrl
        }
        return parsedBaseCard
    }
}


export class ActiveCard extends BaseCard {
    get dateLastActivity() {
        return this.rawData.dateLastActivity
    }

    get dueDate() {
        const dueDate = this.rawData.due ? this.rawData.due : null
        return dueDate
    }

    get urls() {
         const urls = this.getUrls()
         return urls
    }


    private async getCrowdinData(crowdinUrl: string) {
        if (crowdinUrl && crowdinUrl.length > 0) {
            const match = crowdinUrl.match(BaseCard.crowdinLinkPattern)
            if (match) {
                const crowdinProject = match[1].toLowerCase()
                const crowdinProjectId = crowdinProjectIds[crowdinProject]
                const crowdinFileId = match[2]
                
                if (!crowdinProjectId ||!crowdinFileId) return null;
        
                try {
                    const response = await BaseCard.crowdinApi.getFileProgress(
                        Number(crowdinProjectId),
                        Number(crowdinFileId)
                    );
                    const { translationProgress, approvalProgress } = response.data[0].data
                    
                    return {
                        translationProgress,
                        approvalProgress
                    }

                } catch (error) {
                    const message = error instanceof Error ? error.message : "Unknown error"
                    console.error(`Error fetching Crowdin progress for "${this.title}": ${message}`)
                    return null
                }
            }
        }
        return null
    }

    private async getProductStatus() {
        const published = this.datePublished
        if (published) {
            const crowdinUrl = this.urls.crowdinUrl
            if (crowdinUrl) {
                const crowdinData = await this.getCrowdinData(crowdinUrl) ?? {translationProgress: null, approvalProgress: null}
                return {
                    status: 'published',
                    translationProgress: crowdinData.translationProgress,
                    approvalProgress: crowdinData.translationProgress
                }
            } else {
                return {
                    status: published,
                    translationProgress: null,
                    approvalProgress: null
                }
            }
            
        }

        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const hasRecentActivity = new Date(this.dateLastActivity) >= sevenDaysAgo

        if (hasRecentActivity){
            const crowdinUrl = this.urls.crowdinUrl
            if (crowdinUrl) {
                const crowdinData = await this.getCrowdinData(crowdinUrl) ?? {translationProgress: null, approvalProgress: null}
                return {
                    status: 'pending',
                    translationProgress: crowdinData.translationProgress,
                    approvalProgress: crowdinData.approvalProgress
                }
            } else {
                return {
                    status: 'pending',
                    translationProgress: null,
                    approvalProgress: null
                }
            }
               
        }
        return {status: 'unknown'}
    }

    async parseActiveCard() {
        const fields = this.getCustomFields()
       
     
        const productStatus = await this.getProductStatus()

        const parsedActiveCard: ActiveProduct = {
            id: this.id,
            title: this.title,
            productCode: this.productCode,
            targetLanguage: this.targetLanguage,
            productStatus: productStatus.status,
            mediaGroups: this.assignMediaGroups(),
            dateLastActivity: this.dateLastActivity,
            datePublished: this.datePublished,
            dueDate: this.dueDate,
            trelloUrl: this.trelloUrl,
            editorUrl: this.urls.editorUrl,
            crowdinUrl: this.urls.crowdinUrl,
            articleUrl: this.urls.articleUrl,
            youTubeUrl: this.urls.youTubeUrl,
            translationProgress: productStatus.translationProgress ?? null,
            approvalProgress: productStatus.approvalProgress ?? null,
            wordCount: this.wordCount,
            duration: this.getDuration()
        }
        return parsedActiveCard
    }
}


export class ArchivedCard extends BaseCard {
    get dateArchived() {
        const dateArchived = this.rawData.dateClosed ? this.rawData.dateClosed : '';
        return dateArchived
    }

    private async getLocalizedTitle() {
        const url = this.getUrls().articleUrl
        if (url) {
            const title = getlocalizedTitle(url)
            return title
        }
        return null
    }

    async parseArchivedCard() {
        const urls = this.getUrls()
        const parsedArchivedCard: ArchivedProduct = {
            id: this.id,
            title: this.title,
            localizedTitle: await this.getLocalizedTitle(),
            productCode: this.productCode,
            targetLanguage: this.targetLanguage,
            mediaGroups: this.assignMediaGroups(),
            datePublished: this.datePublished,
            dateArchived: this.dateArchived,
            trelloUrl: this.trelloUrl,
            editorUrl: urls.editorUrl,
            articleUrl: urls.articleUrl,
            youTubeUrl: urls.youTubeUrl,
            wordCount: this.wordCount,
            durationSeconds: this.getDuration()
        }
        return parsedArchivedCard
    }
}
