import ISO6391 from "iso-639-1"
import * as cheerio from 'cheerio'

import {
    productCodeEnum,
    customFieldEnum,
    supportedLanguageEnum
} from "../shared/enums.js"
import { 
    type RawTrelloCard, 
    type RawYouTubeData, 
    type RawCrowdinData, 
    type LangOpsProductSchema,
    type TrelloDataSchema,
    type YouTubeDataSchema,
    type CrowdinDataSchema
} from "../shared/types.js"







const groupLookup = new Map();
for (const [groupName, codes] of Object.entries(mediaGroups)) {
    codes.forEach(code => {
        if (!groupLookup.has(code)) {
            groupLookup.set(code, []);
        }
        groupLookup.get(code).push(groupName);
    });
}


/*
 * Factory class that transforms raw Trello data into LangOps products.
 * Logical tests filter out cards which do not meet business logic requirements.
 * A card will be skipped under the following conditions:
 *   1) no product code exists;
 *   2) product code isn't supported;
 *   3) the card is a template;
 *   4) the target language is not one of the supported languages;
 *   5) the "Exclude" checkbox is checked.
*/
export class TrelloProductFactory {

    constructor(private rawTrelloData: RawTrelloCard[]) {
        if (!rawTrelloData) {
            throw new Error("Must init Trello product factory class with data of type rawTrelloData.")
        }
    }

    public trelloData: TrelloDataSchema[] | null = null

    private static wordcountPattern = /(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)/
    private static productCodePattern = /^([A-Z-]*)([0-9]*[A-Z]*)(?=_)/
    private static magazinePattern = /^[A-Z]{2}([0-9]{6})_([A-Z]{2}-[A-Z]{2}$)/
    private static targetLangPattern = /[A-Z]{2}$/
    private static editorPattern = /\/editor\/articles\/posts/
    private static articlePattern = /(?<!editor)\/articles\/posts/
    private static crowdinLinkPattern = /editor\/([A-z]{4,})\/([0-9]{5})/
    private static youTubeLinkPattern = /youtube/



    async getTrelloDataSchema() {

        const trelloDataItems: TrelloDataSchema[] = []

        for (const item of this.rawTrelloData) {

            const getCustomFields = () => {
                const customFields = item.customFieldItems
                let published = false, exclude = false
                if (customFields) {
                    for (const field of customFields) {
                        if (field.idCustomField === customFieldEnum.published && field.value.checked) {
                            published = true
                        }
                        if (field.idCustomField === customFieldEnum.exclude && field.value.checked) {
                            exclude = true
                        }
                    }

                    return {
                        exclude: exclude,
                        published: published,
                    }
                }
                return null
            }
            const customFields = getCustomFields()

            const getProductCode = () => {
                const productCodeMatch = item.name.match(TrelloProductFactory.productCodePattern)
                if (productCodeMatch && productCodeEnum.includes(productCodeMatch[1])) {
                    return productCodeMatch[1]
                }
                return null
            }
            const productCode = getProductCode()

            const getTargetLanguage = () => {
                const targetLangMatch = item.name.match(TrelloProductFactory.targetLangPattern)
                
                if (targetLangMatch) {
                    const code = ISO6391.getName(targetLangMatch[0].toLowerCase())
                    return code
                }
                return null
            }
            const targetLanguage = getTargetLanguage()


            /**
             * Core filtering logic
             * A product will not be created if the card:
             *  1. Has no product code or product code isn't valid;
             *  2. Is a template;
             *  3. Has "Exclude" checked in custom fields;
             *  4. Has missing or unsupported target language
            */

            if (productCode === null || !productCodeEnum.includes(productCode)) {
                console.log(`Skipped: ${item.name} | Reason: Product code invalid or not yet supported (got '${productCode}')`)
                continue
            } else if (item.isTemplate) {
                console.log(`Skipped: ${item.name} | Reason: Card is a template`)
                continue
            } else if (customFields && customFields.exclude) {
                console.log(`Skipped: ${item.name} | Reason: 'Exclude' box is checked`)
                continue
            } else if (!targetLanguage || !supportedLanguageEnum.includes(targetLanguage)) {
                console.log(`Skipped: ${item.name} | Reason: Target language missing or not yet supported (got '${targetLanguage}')`)
                continue
            } else {
                console.log(`Accepted: ${item.name}`)
            }

            /**
             * 
             * Begin product parsing logic
             * 
            */
            
            const getWordCount = () => {
                const wordCountMatch = item.name.match(TrelloProductFactory.wordcountPattern)
                const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : null
                return wordCount
            }
            const wordCount = getWordCount()


            const getUrls = () => {
                let editorUrl = null, articleUrl = null, crowdinUrl = null, youTubeUrl = null
                const cardAttachments = item.attachments ?? null
                if (cardAttachments) {
                    for (const attachment of cardAttachments) {
                        const url = attachment.url
                        const editorMatch = url.match(TrelloProductFactory.editorPattern)
                        const articleMatch = url.match(TrelloProductFactory.articlePattern)
                        const crowdinMatch = url.match(TrelloProductFactory.crowdinLinkPattern)
                        const youTubeMatch = url.match(TrelloProductFactory.youTubeLinkPattern)

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
                return null
            }
            const urls = getUrls()


            const getDatePublished = () => {
                const cardActions = item.actions
                if (!cardActions) return null

                for (const item of cardActions) {
                    const isCheckItemUpdate = item.type === 'updateCheckItemStateOnCard'
                    const isPublishedFlag = item.data?.checkItem?.name?.toLowerCase().includes('[published]')
                    const isComplete = item.data?.checkItem?.state === 'complete'

                    if (isCheckItemUpdate && isPublishedFlag && isComplete) {
                        return item.date
                    }
                }
                return null;
            }
            const datePublished = getDatePublished()

            const isMagazine = () => {
                const magazineMatch = item.name.match(TrelloProductFactory.magazinePattern)
                const magazine = magazineMatch ? magazineMatch[1] : null
                if (magazine) {
                    return true
                }
                return false
            }
            const magazine = isMagazine()

            const assignMediaGroups = () => {
                /**
                 * Assigns one or more media groups.
                 * For source of truth, see productCodes array found in constants.
                 * @return {string[]} mediaGroups - the complete array of assigned media groups.
                */

                const mediaGroups = []
                
                switch (productCode) {
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
                        if (urls?.articleUrl) {
                            mediaGroups.push("audio_video", "website")
                        } else {
                            mediaGroups.push("audio_video")
                        }
                        break
                    }
                    
                    case "LSS": {
                        magazine ? mediaGroups.push("magazines") : mediaGroups.push("website")
                        break
                    }
                    
                    case "OTHER": {
                        
                        if (urls?.youTubeUrl) {
                            mediaGroups.push("audio_video")
                        } else {
                            mediaGroups.push("other")
                        }
                        break
                    }
                    
                    case "POD": {
                        if (urls?.articleUrl || urls?.youTubeUrl) {
                            mediaGroups.push("audio_video", "website")
                        } else {
                            mediaGroups.push("audio_video")
                        }
                        break
                    }

                    case "PT": {
                        magazine ? mediaGroups.push("magazines") : mediaGroups.push("website")
                        break
                    }

                    case "PTVID": {
                        if (urls?.articleUrl || urls?.youTubeUrl) {
                            mediaGroups.push("audio_video", "website")
                        } else {
                            mediaGroups.push("audio_video")
                        }
                        break
                    }

                    case "RV": {
                        magazine ? mediaGroups.push("magazines") : mediaGroups.push("website") 
                        break
                    }
                    
                }
                return mediaGroups
            }
            const mediaGroups = assignMediaGroups()

            const dateArchived = item.dateClosed ?? null

            const trelloData: TrelloDataSchema = {
                id: item.id,
                url: item.url,
                title: item.name,
                productCode: productCode,
                targetLanguage: targetLanguage,
                dueDate: item.due ?? null,
                datePublished: datePublished,
                dateLastActivity: item.dateLastActivity,
                dateArchived: dateArchived,
                mediaGroups: mediaGroups,
                editorUrl: urls?.editorUrl ?? null,
                articleUrl: urls?.articleUrl ?? null,
                wordCount: wordCount
            }

            trelloDataItems.push(trelloData)
            
        }

        

        this.trelloData = trelloDataItems
    }
}







class LangOpsProductFactory {

    getProductStatus = () => {
                
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
}