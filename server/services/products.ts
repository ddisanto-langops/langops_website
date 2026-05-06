import { ActiveProduct, ArchivedProduct, RawTrelloCard } from "../../shared/types.js"
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
        console.log(`getAllCards: ${error.message}`)
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
        console.log(`getArchivedCards: ${error.message}`)
    }
}

// Shared card parsing logic for both active and archived cards
export function getTrelloProducts(cards: RawTrelloCard[]) {
    let productData: ActiveProduct[] = []

    const productCodePattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)';
    const wordcountPattern = '(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)';
    const editionCode = '^([A-Z-]*)([0-9]*[A-Z]*)(_[A-Z]{2})'

    for (const card of cards) {
        
        const title = card.name
        const productCode = () => (
            title.match(productCodePattern) ? title.match(productCodePattern)[1] : null
        )

        // Exclusion logic
        // Skip if product code absent, invalid, or if card is a template
        const skipCard = (card: RawTrelloCard) => {
            let exclude = false
            if (card.customFieldItems) {
                exclude = card.customFieldItems.some(
                    item => item.idCustomField === customFields.exclude 
                    && item.value.checked === 'true'
                )
            }
            
            if (!productCode() || !productCodes.includes(productCode()) || card.isTemplate === true || exclude) {
                return true
            } else {
                return false
            }
        }
        
        if (skipCard(card)) {
            console.log(`skipped: ${card.name}`)
            continue
        } else {
            console.log(`accepted: ${card.name}`)
        }

        // Custom fields
        let published = null, crowdinProjectId = null, crowdinFileId = null
        published = card.customFieldItems.some(
            item => item.idCustomField === customFields.published 
                && item.value.checked === 'true'
        ) || null

        crowdinProjectId = card.customFieldItems.find(
            item => item.idCustomField === customFields.crowdinProj
        )?.value.text ?? null

        crowdinFileId = card.customFieldItems.find(
            item => item.idCustomField === customFields.crowdinFile
        )?.value.text ?? null



        const id = card.id
        const wordCount = title.match(wordcountPattern) ? parseInt(title.match(wordcountPattern)[1]) : null
        const due = card.due;
        const lastActivity = card.dateLastActivity;
        const dateArchived = card.dateClosed ? new Date(card.dateClosed) : null;
        const trelloUrl = card.url;

        const targetLang = () => {
            const match = Object.entries(trelloLangIds).find(
                ([, id]) => card.idLabels?.includes(id)
            )
            return match ? match[0] : null
        }

        const wordcount = () => (

            title.match(wordcountPattern) ? title.match(wordcountPattern)[1] : null
        )
        const edition = () => (
            title.match(editionCode) ? title.match(editionCode)[2] : null
        )

        const mediaGroup = () => {
            const isMagazine = edition()
            const productMediaType = groupLookup.get(productCode()) || []
            const labelMediaType = (card.labels ?? []).flatMap(label => 
                groupLookup.get(label.name) ?? []
            )
            const mediaType = [...new Set([...productMediaType, ...labelMediaType, ...(isMagazine ? ['magazine'] : [])])]
            return mediaType
        }

        // Attachments: Crowdin, editor and article URL
        let crowdinUrl = null, editorUrl = null, articleUrl = null
        for (const attachment of card.attachments ?? []) {
            attachment.name.includes("Crowdin") ? crowdinUrl = attachment.url : null
            attachment.name.includes("Edit Article") ? editorUrl = attachment.url : null
            attachment.name.match("Article") ? articleUrl = attachment.url : null
        }
        
        const datePublished = () => {
            if (published) {
                for (const item of card.actions) {
                    if (
                        item.type === 'updateCheckItemStateOnCard' &&
                        item.data?.checkItem?.name?.toLowerCase().includes('[published]') &&
                        item.data?.checkItem?.state === 'complete'
                    ) {
                        return item.date
                    }
                }
            }
        }
        
        
        productData.push({
            id,
            title,
            productCode: productCode(),
            targetLang: targetLang(),
            trelloUrl,
            articleUrl,
            editorUrl,
            crowdinUrl,
            due,
            lastActivity,
            published,
            datePublished: datePublished(),
            crowdinProjectId,
            crowdinFileId,
            mediaGroup: mediaGroup(),
            wordCount,
            dateArchived
        })
    }
    return productData
}

// =====================
// ENRICHMENT
// =====================

async function getCrowdinFileProgress(projectId, fileId) {
    if (!projectId || !fileId) return null;
    try {
        const translationStatusApi = new TranslationStatus({
            token: process.env.crowdinToken
        });

        const response = await translationStatusApi.getFileProgress(projectId, fileId);
        const translationProgress = response.data[0].data.translationProgress
        const approvalProgress = response.data[0].data.approvalProgress
        return { translationProgress, approvalProgress }

    } catch (error) {
        console.error("Error fetching file progress:", error.message);
        return { translationProgress: 0, approvalProgress: 0 };
    }
}


function getProductStatus(product) {
    if (product.published) return 'published'

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const hasRecentActivity = new Date(product.lastActivity) >= sevenDaysAgo
    const hasTranslationProgress = product.translationProg > 0

    if (hasTranslationProgress || hasRecentActivity) return 'pending'
    return 'unknown'
}

export async function getProductData(trelloData) {
    try {
        const enrichedProducts = await Promise.all(
            trelloData.map(async (product) => {
                if (!product.crowdinProjectId || !product.crowdinFileId) {
                    return {
                        ...product,
                        translationProg: null,
                        approvalProg: null,
                        productStatus: getProductStatus({...product, translationProg: null})
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
                    productStatus: getProductStatus({
                        ...product, 
                        translationProg: crowdinProgress.translationProgress
                    }),
                }
            })
        )
        return enrichedProducts

    } catch (error) {
        console.log(`getProductData: ${error.stack}`)
    }
}

// =====================
// DATABASE
// =====================

export async function upsertProducts(products) {
    for (const product of products) {
        await pool.query(`
            INSERT INTO products (
                id, title, productCode, targetLang, productStatus,
                crowdinUrl, trelloUrl, article_url,
                editor_url, due, lastActivity,
                published, datePublished, translationProg, approvalProg,
                mediaType, wordCount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            ON CONFLICT (id) DO UPDATE SET
                id              = EXCLUDED.id,
                productCode     = EXCLUDED.productCode,
                targetLang      = EXCLUDED.targetLang,
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
            product.targetLang,
            product.productStatus,
            product.crowdinUrl ?? null,
            product.trelloUrl,
            product.editorUrl ?? null,
            product.articleUrl ?? null,
            product.due ?? null,
            product.lastActivity ?? null,
            product.published,
            product.datePublished ?? null,
            product.translationProg ?? null,
            product.approvalProg ?? null,
            product.mediaType ?? null,
            product.wordCount ?? null
        ])
    }
}

export async function upsertArchivedProducts(archivedProducts) {
    for (const product of archivedProducts) {
        if (!product.published) continue
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
            product.lastActivity ?? null,
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