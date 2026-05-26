import type { BaseProduct, ActiveProduct, ArchivedProduct, RawTrelloCard } from "../shared/types.js"

import { 
    customFields,
    productCodes, 
    mediaGroups,
} from '../shared/constants.js';
import { TranslationStatus } from '@crowdin/crowdin-api-client';
import ISO6391 from "iso-639-1"
import { getlocalizedTitle } from "./services/syncFunctions.js";


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
    static magazinePattern = /^[A-Z]{2}([0-9]{6})_([A-Z]{2}$)/
    static targetLangPattern = /[A-Z]{2}$/
    static editorPattern = /\/editor\/articles\/posts/
    static articlePattern = /(?<!editor)\/articles\/posts/
    static crowdinPattern = /crowdin/

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
        let editorUrl = null, articleUrl = null, crowdinUrl = null
        for (const attachment of cardAttachments ?? []) {
            const url = attachment.url
            const editorMatch = url.match(BaseCard.editorPattern)
            const articleMatch = url.match(BaseCard.articlePattern)
            const crowdinMatch = url.match(BaseCard.crowdinPattern)

            if (editorMatch) {
                editorUrl = url
            } else if (articleMatch) {
                articleUrl = url
            } else if (crowdinMatch) {
                crowdinUrl = url
            }
        }
        return {
            crowdinUrl: crowdinUrl,
            editorUrl: editorUrl,
            articleUrl: articleUrl
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

    protected getMediaGroups() {
        const magazineMatch = this.title.match(BaseCard.magazinePattern)
        const magazine = magazineMatch ? magazineMatch[1] : null
        if (magazine) {
            return ['magazines']
        } else {
            const productMediaType = groupLookup.get(this.productCode) ?? []
            const labelMediaType = (this.labels ?? []).flatMap(label => 
                groupLookup.get(label.name) ?? []
            )
            const mediaType = [...new Set([...productMediaType, ...labelMediaType])]
            return mediaType
        }
    }

    public getCustomFields() {
        const cardCustomFields = this.rawData.customFieldItems ?? null
        let published = false, crowdinProjectId = null, crowdinFileId = null, exclude = false
        if (cardCustomFields) {
            for (const field of cardCustomFields) {
                if (field.idCustomField === customFields.published) {
                    published = field.value.checked === "true";
                    }
                    if (field.idCustomField === customFields.crowdinProj) {
                        crowdinProjectId = field.value.text ?? null;
                    }
                    if (field.idCustomField === customFields.crowdinFile) {
                        crowdinFileId = field.value.text ?? null;
                    }
                    if (field.idCustomField === customFields.exclude) {
                        exclude = field.value.checked === "true";
                    }
                }
        }
        return {
            published: published,
            crowdinProjectId: crowdinProjectId,
            crowdinFileId: crowdinFileId,
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
            mediaGroups: this.getMediaGroups(),
            published: fields.published,
            crowdinProjectId: fields.crowdinProjectId,
            crowdinFileId: fields.crowdinFileId,
            exclude: fields.exclude,
            labels: this.labels,
            wordCount: this.wordCount,
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

    private async getCrowdinData() {
        const token = process.env.crowdintoken
        const { crowdinProjectId, crowdinFileId } = this.getCustomFields()
        
        if (!token || !crowdinProjectId ||!crowdinFileId) return null;
        
        try {
            const api = new TranslationStatus({ token })
            const response = await api.getFileProgress(
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

    private async getProductStatus() {
        const crowdinData = await this.getCrowdinData() ?? {translationProgress: null, approvalProgress: null}
        const published = this.datePublished
        if (published) return 'published'
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const hasRecentActivity = new Date(this.dateLastActivity) >= sevenDaysAgo
        if (crowdinData || hasRecentActivity) return 'pending'
        return 'unknown'
    }

    async parseActiveCard() {
        const fields = this.getCustomFields()
        const urls = this.getUrls()
        const crowdinData = await this.getCrowdinData() ?? { 
            translationProgress: 0, 
            approvalProgress: 0 
        };
        const productStatus = await this.getProductStatus()

        const parsedActiveCard: ActiveProduct = {
            id: this.id,
            title: this.title,
            productCode: this.productCode,
            targetLanguage: this.targetLanguage,
            productStatus: productStatus,
            mediaGroups: this.getMediaGroups(),
            excluded: fields.exclude,
            dateLastActivity: this.dateLastActivity,
            datePublished: this.datePublished,
            dueDate: this.dueDate,
            trelloUrl: this.trelloUrl,
            editorUrl: urls.editorUrl,
            crowdinUrl: urls.crowdinUrl,
            articleUrl: urls.articleUrl,
            translationProgress: crowdinData?.translationProgress,
            approvalProgress: crowdinData?.approvalProgress,
            wordCount: this.wordCount
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
            mediaGroups: this.getMediaGroups(),
            datePublished: this.datePublished,
            dateArchived: this.dateArchived,
            trelloUrl: this.trelloUrl,
            editorUrl: urls.editorUrl,
            articleUrl: urls.articleUrl,
            wordCount: this.wordCount
        }
        return parsedArchivedCard
    }
}
