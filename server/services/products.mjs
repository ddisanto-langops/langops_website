import fetch from 'node-fetch'
import { TranslationStatus } from '@crowdin/crowdin-api-client';
import { 
    customFields,
    trelloLangIds, 
    productCodes, 
    mediaGroups 
} from './constants.mjs';
import pool from '../database/databaseConfig.mjs';

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
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true`,
            { method: 'GET' }
        )
        return response.json()
    } catch (error) {
        console.log(`getAllCards: ${error.message}`)
    }
}

export async function getArchivedCards() {
    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0];
    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&since=${yesterday}`,
            { method: 'GET' }
        )
        return response.json()
    } catch (error) {
        console.log(`getArchivedCards: ${error.message}`)
    }
}

// Shared card parsing logic for both active and archived cards
export function getTrelloProducts(cards) {
    const productCodePattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)';
    const wordcountPattern = '(?<=-)(?:[A-Z+]*)([0-9]{1,})(?=_)';

    if (!cards) return []

    try {
        const productData = []

        for (const card of cards) {
            const title = card.name;
            
            const productCode = title.match(productCodePattern)?.[1];
            if (!productCode || !productCodes.includes(productCode) || card.isTemplate === true) continue;

            const due = card.due;
            const lastActivity = card.dateLastActivity;
            const trelloUrl = card.url;

            // Target language via label ID
            const targetLang = (() => {
                const match = Object.entries(trelloLangIds).find(
                    ([, id]) => card.idLabels?.includes(id)
                )
                return match ? match[0] : null
            })()

            // Crowdin URL from attachments
            const crowdinUrl = card.attachments?.find(
                a => a.name.includes("Crowdin")
            )?.url ?? null

            // Custom fields
            let published = null, crowdinProjectId = null, crowdinFileId = null

            if (card.customFieldItems) {
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
            }

            // Word count from title
            const wordCountMatch = title.match(wordcountPattern)
            const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : null

            // Media type from product code and labels
            const productMediaType = groupLookup.get(productCode) || []
            const labelMediaTypes = (card.labels ?? []).flatMap(label => 
                groupLookup.get(label.name) ?? []
            )
            const mediaType = [...new Set([...productMediaType, ...labelMediaTypes])]

            productData.push({
                title,
                productCode,
                targetLang,
                trelloUrl,
                crowdinUrl,
                due,
                lastActivity,
                published,
                crowdinProjectId,
                crowdinFileId,
                mediaType,
                wordCount,
            })
        }

        return productData

    } catch (error) {
        console.log(`getTrelloProducts: ${error.stack}`)
    }
}

// =====================
// CROWDIN
// =====================

async function getCrowdinFileProgress(projectId, fileId) {
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

// =====================
// ENRICHMENT
// =====================

function getProductStatus(product) {
    if (product.published) return 'published'

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentActivity = new Date(product.lastActivity) >= sevenDaysAgo
    const hasTranslationProgress = product.translationProg > 0

    if (hasTranslationProgress || recentActivity) return 'pending'
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
                title, productCode, targetLang, productStatus,
                crowdinUrl, trelloUrl, due, lastActivity,
                published, translationProg, approvalProg,
                mediaType, wordCount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
            ON CONFLICT (title) DO UPDATE SET
                productCode     = EXCLUDED.productCode,
                targetLang      = EXCLUDED.targetLang,
                productStatus   = EXCLUDED.productStatus,
                crowdinUrl      = EXCLUDED.crowdinUrl,
                trelloUrl       = EXCLUDED.trelloUrl,
                due             = EXCLUDED.due,
                lastActivity    = EXCLUDED.lastActivity,
                published       = EXCLUDED.published,
                translationProg = EXCLUDED.translationProg,
                approvalProg    = EXCLUDED.approvalProg,
                mediaType       = EXCLUDED.mediaType,
                wordCount       = EXCLUDED.wordCount
        `, [
            product.title,
            product.productCode,
            product.targetLang,
            product.productStatus,
            product.crowdinUrl ?? null,
            product.trelloUrl,
            product.due ?? null,
            product.lastActivity ?? null,
            product.published,
            product.translationProg ?? null,
            product.approvalProg ?? null,
            product.mediaType ?? null,
            product.wordCount ?? null
        ])
    }
}

export async function upsertArchivedProducts(archivedProducts) {
    for (const product of archivedProducts) {
        await pool.query(`
            INSERT INTO completions (
                title, productCode, targetLang,
                mediaType, wordCount, datePublished, trello_url
            ) VALUES ($1,$2,$3,$4,$5,$6,$7)
            ON CONFLICT (title) DO UPDATE SET
                targetlang  = EXCLUDED.targetlang,
                productcode = EXCLUDED.productcode
        `, [
            product.title,
            product.productCode,
            product.targetLang,
            product.mediaType ?? null,
            product.wordCount ?? null,
            product.lastActivity ?? null,
            product.trelloUrl ?? null
        ])
    }
}

export async function archiveProducts(activeTitles) {
    await pool.query(`
        DELETE FROM products
        WHERE title != ALL($1)
    `, [activeTitles])

    await pool.query(`
        UPDATE completions
        SET dateArchived = NOW()
        WHERE dateArchived IS NULL
        AND title != ALL($1)
    `, [activeTitles])
}