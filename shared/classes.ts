import type { BaseProduct, ActiveProduct, ArchivedProduct, RawTrelloCard } from "./types.js"

import { 
    customFields,
    trelloLangIds, 
    productCodes, 
    mediaGroups 
} from './constants.js';

export class BaseCard {
    protected rawData: RawTrelloCard

    protected trelloBoardId = process.env.TrelloBoardId;
    protected trelloKey = process.env.TrelloKey;
    protected trelloToken = process.env.TrelloToken;

    constructor(data: RawTrelloCard) {
        this.rawData = data
    }

    get id() {
        return this.rawData.id
    }

    get title() {
        return this.rawData.name
    }

    get productCode() {
        const productCodePattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)'
        const productCodeMatch = this.title.match(productCodePattern)
        const productCode = productCodeMatch ? productCodeMatch[0] : "INVALID"
        return productCode
    }

    get targetLanguage() {
        const targetLangPattern = '(?<=_)([AENSFINLRDTOPH]{2})(?:[-])([AENSFINLRDTOPH]{2})(?![A-Za-z-])'
        const targetLangMatch = this.title.match(targetLangPattern)
        const targetLanguage = targetLangMatch ? targetLangMatch[2] : "INVALID"
        return targetLanguage
    }

    get trelloUrl() {
        return this.rawData.url
    }

    get wordCount() {
        const wordcountPattern = '(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)'
        const wordCountMatch = this.title.match(wordcountPattern)
        const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : 0
        return wordCount
    }

    get labels() {
        return this.rawData.labels 
    }

    protected getMediaGroups() {
        const mediaGroup = () => {
            const groupLookup = new Map();
            for (const [groupName, codes] of Object.entries(mediaGroups)) {
                codes.forEach(code => {
                    if (!groupLookup.has(code)) {
                        groupLookup.set(code, []);
                    }
                    groupLookup.get(code).push(groupName);
                });
            }

            const editionPattern = '^([A-Z-]*)([0-9]*[A-Z]*)(_[A-Z]{2})'
            const editionMatch = this.title.match(editionPattern)
            const edition = editionMatch ? editionMatch[2] : null
            const productMediaType = groupLookup.get(this.productCode) || []
            const labelMediaType = (this.labels ?? []).flatMap(label => 
                groupLookup.get(label.name) ?? []
            )
            const mediaType = [...new Set([...productMediaType, ...labelMediaType, ...(edition ? ['magazine'] : [])])]
            return mediaType
        }
        return mediaGroup()
    }

    protected getCustomFields() {
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

    parse() {
        const parsedBaseCard: BaseProduct = {
            id: this.id,
            title: this.title,
            productCode: this.productCode,
            targetLanguage: this.targetLanguage,
            mediaGroups: this.getMediaGroups(),
            customFields: this.getCustomFields(),
            labels: this.labels,
            wordCount: this.wordCount,
            trelloUrl: this.trelloUrl
        }
        return parsedBaseCard
    }
}

class ActiveCard extends BaseCard {
    
}