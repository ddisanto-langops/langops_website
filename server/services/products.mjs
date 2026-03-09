import fetch from 'node-fetch'
import { TranslationStatus } from '@crowdin/crowdin-api-client';
import { customFields, languageCodes, productCodes, productGroups } from './constants.mjs';

const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;



// lookup
// Pre-process the groups into a Map of arrays
const groupLookup = new Map();

for (const [groupName, codes] of Object.entries(productGroups)) {
    codes.forEach(code => {
        if (!groupLookup.has(code)) {
            groupLookup.set(code, []);
        }
        groupLookup.get(code).push(groupName);
    });
}


async function getAllCards() {     

    try {
        const response = await fetch(`https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}`, {
            method: 'GET'
        })
        return response.json()

    } catch (error) {
        console.log(`getAllCards: ${error.message}`)
    }
}


async function getTrelloProducts(cards) {

    const productCodePattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)';
    const targetLangPattern = '(?<=_)([AENSFINLRDTOPH]{2})(?:[-])([AENSFINLRDTOPH]{2})(?![A-Za-z-])';

    let productData = [];

    try {

        for (let card of cards) {

            const title = card.name;
            
            // If card isn't a valid product as defined in constants, skip to next one
            const productCode = title.match(productCodePattern)?.[1];
            if (!productCode || !productCodes.includes(productCode) || card.isTemplate === true) continue;


            // If card is a valid product, get the expanded data
            let cardJson = null;
            try {
                const cardId = card.id
                const params = new URLSearchParams({
                    fields: 'all',
                    attachments: 'true',
                    attachment_fields: 'all',
                    customFieldItems: true
                });

                const r = await fetch(`https://api.trello.com/1/cards/${cardId}?key=${trelloKey}&token=${trelloToken}&params=${params.toString()}`, {
                    method: 'GET'
                })
                cardJson = await r.json();

            } catch (error) {
                console.log(`Error fetching card JSON: ${error.message}`)
            }
            
            // Skip if no expanded data available
            if (!cardJson) continue;

            // Otherwise, get simple Trello data:
            const due = cardJson.due;
            const lastActivity = cardJson.dateLastActivity;
            const trelloUrl = card.url;
            const targetLang = languageCodes[title.match(targetLangPattern)?.[2]];
            
            // Find Crowdin URL if present
            let crowdinUrl = null;
            for (let attachment of cardJson.attachments) {
                attachment.name === "Crowdin" ? crowdinUrl = attachment.url : null
            }
            
            // Is "published" checked off?
            let published = false;
            for (let item of cardJson.customFieldItems) {
                if (item.idCustomField === customFields.published && item.value.checked === 'true') {
                    published = true
                }
            }

            // Has Crowdin project ID?
            let crowdinProjectId = null;
            for (let item of cardJson.customFieldItems) {
                if (item.idCustomField === customFields.crowdinProj) {
                    crowdinProjectId = item.value.text
                }
            }

            // Has Crowdin file ID?
            let crowdinFileId = null;
            for (let item of cardJson.customFieldItems) {
                if (item.idCustomField === customFields.crowdinFile) {
                    crowdinFileId = item.value.text
                }
            }

            productData.push({
                // TODO: finish building this JSON structure to match desired schema
                "title": title,
                "productCode": productCode,
                "targetLang": targetLang,
                "trelloUrl": trelloUrl,
                "crowdinUrl": crowdinUrl,
                "due": due,
                "lastActivity": lastActivity,
                "published": published,
                "crowdinProjectId": crowdinProjectId,
                "crowdinFileId": crowdinFileId
                
            }) 
        
    }
    
    return productData

    } catch (error) {
        console.log(`extractProducts: ${error.message}`)
    }
}

async function getCrowdinFileProgress(projectId, fileId) {
    try {
        const translationStatusApi = new TranslationStatus({
            token: process.env.crowdinToken
        });

        const response = await translationStatusApi.getFileProgress(projectId, fileId);
        const translationProgress = response.data[0].data.translationProgress
        const approvalProgress = response.data[0].data.approvalProgress
        return {
            translationProgress: translationProgress,
            approvalProgress: approvalProgress
        }

    } catch (error) {
        console.error("Error fetching file progress:", error.message);
        return { translationProgress: 0, approvalProgress: 0 };
    }
}

function getProductStatus(product) {
    if (product.published) return 'completed'

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() -7)
    const lastActivity = new Date(product.lastActivity)
    const recentActivity = lastActivity >= sevenDaysAgo

    const hasTranslationProgress = product.translationProg > 0

    if (hasTranslationProgress || recentActivity) return 'pending'

    return 'unknown'
}

function getMediaInfo(product) {
    const wordcountPattern = '(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)';
    const title = product.title;
    
    // Extract word count from regex match
    const wordCountMatch = title.match(wordcountPattern);
    const wordCount = wordCountMatch ? wordCountMatch[1] : null;
    
    const duration = null;
    const productCode = product.productCode;
    
    // FAST LOOKUP: Returns array of group names, or empty array if not found
    const mediaType = groupLookup.get(productCode) || [];

    return {
        mediaType: mediaType,
        wordCount: wordCount,
        duration: duration
        }
    
}


export async function getProductData(trelloData) {
    try {
        const enrichedProducts = await Promise.all(
            trelloData.map(async (product) => {
                
                // Only fetch Crowdin data if both IDs are present
                if (!product.crowdinProjectId || !product.crowdinFileId) {
                    return {
                        ...product,
                        translationProg: null,
                        approvalProg: null,
                        productStatus: getProductStatus({...product, translationProg: null}),
                        mediaInfo: getMediaInfo({...product})

                    }
                }

                const crowdinProgress = await getCrowdinFileProgress(
                    product.crowdinProjectId,
                    product.crowdinFileId,
                )

                return {
                    ...product,
                    translationProg: crowdinProgress.translationProgress,
                    approvalProg: crowdinProgress.approvalProgress,
                    productStatus: getProductStatus({...product, translationProg: crowdinProgress.translationProgress}),
                    mediaInfo: getMediaInfo({...product})
                }
            })
        )

        return enrichedProducts

    } catch (error) {
        console.log(`productData: ${error.message}`)
    }
}

// TESTING
const cards =  await getAllCards()
const trelloProducts = await getTrelloProducts(cards)
const products = await getProductData(trelloProducts)

console.log(products)