import type { ActiveProduct, ArchivedProduct, RawTrelloCard } from "../../shared/types.js"
import fetch from 'node-fetch'
import { TranslationStatus } from '@crowdin/crowdin-api-client';
import { 
    customFields,
    trelloLangIds, 
    productCodes, 
    mediaGroups 
} from '../../shared/constants.js';
import pool from '../database/databaseConfig.js';

const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;

// Pre-processes the groups into a Map of arrays
const groupLookup = new Map();
for (const [groupName, codes] of Object.entries(mediaGroups)) {
    codes.forEach(code => {
        if (!groupLookup.has(code)) {
            groupLookup.set(code, []);
        }
        groupLookup.get(code).push(groupName);
    });
}

// =====================
// TRELLO
// =====================

export async function getActiveCards() {
    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true&actions=all`,
            { method: 'GET' }
        )
        return response.json()
    } catch (error) {
        error instanceof Error ? console.log(`Get Active Cards: ${error.message}`) : 
            console.log("Get Active Cards: Unkown error")
    }
}

export async function getArchivedCards(since = null) {
    
    if (since) {
        try {
            const sinceDate = new Date(since)
        } catch (error) {
            console.log(`Invalid date format for 'since': ${since}`)
        }
    }
    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0];
    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&since=${since ? since : yesterday}`,
            { method: 'GET' }
        )
        return response.json()
    } catch (error) {
        error instanceof Error ? console.log(`Get Arhived Cards: ${error.message}`) :
        console.log("Get Archived Cards: Unknown  error")
    }
}

// Shared card parsing logic for both active and archived cards
export async function parseActiveCards(cards: RawTrelloCard[]) {
    let productData: ActiveProduct[] = []

    const productCodePattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)'
    const wordcountPattern = '(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)'
    const editionCode = '^([A-Z-]*)([0-9]*[A-Z]*)(_[A-Z]{2})'

    for (const card of cards) {
        const title = card.name
        // Custom fields
        const parseCustomFields = () => {
            let published = false, crowdinProjectId = null, crowdinFileId = null, exclude = false
            if (card.customFieldItems) {
                for (const field of card.customFieldItems) {
                    if (field.idCustomField === customFields.published && field.value.checked === "true") {
                        published = true
                    } else if (field.idCustomField === customFields.crowdinProj) {
                        crowdinProjectId = field.value.text
                    } else if (field.idCustomField === customFields.crowdinFile) {
                        crowdinFileId = field.value.text
                    } else if (field.idCustomField === customFields.exclude && field.value.checked === "true") {
                        exclude = true
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
        const cardCustomFields = parseCustomFields()
        
        const getTargetLanguage = () => {
            const match = Object.entries(trelloLangIds).find(
                ([, id]) => card.idLabels?.includes(id)
            ) || null
            if (match) {
                return match[0]
            } else {
                return null
            }
        }
        const targetLanguage = getTargetLanguage()

        /*
        * Exclusion logic
        * Skip if product code absent, invalid, card is a template, exclude is checked, or no target langugae
        */
        const regexProductCode = title.match(productCodePattern)
        if (!regexProductCode){
            console.log(`skipped: ${card.name} | Reason: Missing product code`)
            continue
        } else if (!productCodes.includes(regexProductCode[0])) {
            console.log(`skipped: ${card.name} | Reason: Product code invalid or not yet supported`)
            continue
        } else if (card.isTemplate === 'true') {
            console.log(`Skipped: ${card.name} | Reason: Card is a template`)
            continue
        } else if (cardCustomFields.exclude) {
            console.log(`Skipped: ${card.name} | Reason: 'Exclude' box is checked`)
            continue
        } else if (!targetLanguage) {
            console.log(`Skipped: ${card.name} | Reason: Missing target language`)
            continue
        }
        else {
            console.log(`accepted: ${card.name}`)
        }

        const id = card.id
        const regexWordCount = title.match(wordcountPattern) 
        const wordCount = regexWordCount ? parseInt(regexWordCount[1]) : null
        const due = card.due ?? null;
        const lastActivity = card.dateLastActivity;
        const dateArchived = card.dateClosed ? card.dateClosed : null;
        const trelloUrl = card.url;

        const regexEdition = title.match(editionCode)
        const edition = regexEdition ? regexEdition[2] : null

        const mediaGroup = () => {
            const productMediaType = groupLookup.get(regexProductCode[0]) || []
            const labelMediaType = (card.labels ?? []).flatMap(label => 
                groupLookup.get(label.name) ?? []
            )
            const mediaType = [...new Set([...productMediaType, ...labelMediaType, ...(edition ? ['magazine'] : [])])]
            return mediaType
        }

        // Attachments: Crowdin, editor and article URL
        let crowdinUrl = null, editorUrl = null, articleUrl = null
        for (const attachment of card.attachments ?? []) {
            attachment.name.includes("Crowdin") ? crowdinUrl = attachment.url : null
            attachment.name.includes("Edit Article") ? editorUrl = attachment.url : null
            attachment.name.match("Article") ? articleUrl = attachment.url : null
        }
        
        const getDatePublished = () => {
            if (!cardCustomFields || !card.actions) return null
            for (const item of card.actions) {
                if (
                    item.type === 'updateCheckItemStateOnCard' &&
                    item.data?.checkItem?.name?.toLowerCase().includes('[published]') &&
                    item.data?.checkItem?.state === 'complete'
                ) {
                    return item.date
                } else {
                    continue
                }
            }
            return null
        }
        const datePublished = getDatePublished()
        
        const getCrowdinData = async () => {
            const token = process.env.crowdintoken
            if (!token ||
                !cardCustomFields.crowdinProjectId ||
                !cardCustomFields.crowdinFileId
            ) return null;
            
            try {
                const translationStatusApi = new TranslationStatus({
                    token: token
                });
                const response = await translationStatusApi.getFileProgress(
                    Number(cardCustomFields.crowdinProjectId),
                    Number(cardCustomFields.crowdinFileId)
                );
                const translationProgress = response.data[0].data.translationProgress
                const approvalProgress = response.data[0].data.approvalProgress
                return { translationProgress: translationProgress, approvalProgress: approvalProgress }

            } catch (error) {
                error instanceof Error ? console.error(`
                    Error fetching file progress: 
                        ${card.name}
                        ${error.message}
                    `): 
                console.error("Unknown error getting Crowdin file info.");
                return null
            }
        }
        const crowdinData = await getCrowdinData() ?? {translationProgress: null, approvalProgress: null}

        const getProductStatus = () => {
            if (cardCustomFields.published) return 'published'
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            const hasRecentActivity = new Date(lastActivity) >= sevenDaysAgo
            if (crowdinData || hasRecentActivity) return 'pending'
            return 'unknown'
        }
        const productStatus = getProductStatus()
        
        productData.push({
            id: id,
            title: title,
            productCode: regexProductCode[0],
            targetLanguage: targetLanguage,
            productStatus: productStatus,
            mediaGroups: mediaGroup(),
            published: cardCustomFields.published,
            dateLastActivity: lastActivity,
            trelloUrl: trelloUrl,
            articleUrl: articleUrl,
            editorUrl: editorUrl,
            crowdinUrl: crowdinUrl,
            dueDate: due,
            datePublished: datePublished,
            translationProgress: crowdinData.translationProgress,
            approvalProgress: crowdinData.approvalProgress,
            wordCount: wordCount,
        })
    }
    return productData
}


export function parseArchivedCards(cards: RawTrelloCard[]) {
    let productData: ActiveProduct[] = []
}


// =====================
// DATABASE
// =====================

export async function upsertProducts(products: ActiveProduct[]) {
    for (const product of products) {
        await pool.query(`
            INSERT INTO products (
                id, title, productcode, targetlang, productstatus,
                crowdinurl, trellourl, article_url,
                editor_url, due, lastactivity,
                published, datepublished, translationprog, approvalprog,
                mediatype, wordcount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            ON CONFLICT (id) DO UPDATE SET
                title           = EXCLUDED.title,
                productCode     = EXCLUDED.productCode,
                targetLanguage      = EXCLUDED.targetLanguage,
                productStatus   = EXCLUDED.productStatus,
                crowdinUrl      = EXCLUDED.crowdinUrl,
                trelloUrl       = EXCLUDED.trelloUrl,
                editor_url      = EXCLUDED.editor_url,
                article_url     = EXCLUDED.article_url,
                due             = EXCLUDED.due,
                lastActivity    = EXCLUDED.lastActivity,
                published       = EXCLUDED.published,
                datePublished   = EXCLUDED.datePublished,
                translationProg = EXCLUDED.translationProg,
                approvalProg    = EXCLUDED.approvalProg,
                mediaType       = EXCLUDED.mediaType,
                wordCount       = EXCLUDED.wordCount
        `, [
            product.id,
            product.title,
            product.productCode,
            product.targetLanguage,
            product.productStatus,
            product.crowdinUrl ?? null,
            product.trelloUrl,
            product.editorUrl ?? null,
            product.articleUrl ?? null,
            product.dueDate ?? null,
            product.dateLastActivity ?? null,
            product.published,
            product.datePublished ?? null,
            product.translationProgress ?? null,
            product.approvalProgress ?? null,
            product.mediaGroups ?? null,
            product.wordCount ?? null
        ])
    }
}

export async function upsertArchivedProducts(archivedProducts: ArchivedProduct[]) {
    for (const product of archivedProducts) {
        if (!product.datePublished) continue
        await pool.query(`
            INSERT INTO completions (
                id, title, productCode, targetLang,
                mediaType, wordCount, datePublished, trello_url,
                article_url, editor_url, dateArchived
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
                id          = EXCLUDED.id,
                targetlang  = EXCLUDED.targetlang,
                productcode = EXCLUDED.productcode,
                article_url = EXCLUDED.article_url,
                editor_url  = EXCLUDED.editor_url,
                trello_url  = EXCLUDED.trello_url,
                datearchived = EXCLUDED.dateArchived
        `, [
            product.id,
            product.title,
            product.productCode,
            product.targetLang,
            product.mediaType ?? null,
            product.wordCount ?? null,
            product.trelloUrl,
            product.articleUrl ?? null,
            product.editorUrl ?? null,
            product.dateArchived ?? null
        ])
    }
}

export async function archiveProducts(activeIds) {
    await pool.query(`
        DELETE FROM products
        WHERE id != ALL($1)
    `, [activeIds])

    await pool.query(`
        UPDATE completions
        SET dateArchived = NOW()
        WHERE dateArchived IS NULL
        AND id != ALL($1)
    `, [activeIds])
}