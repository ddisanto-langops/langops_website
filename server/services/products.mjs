import fetch from 'node-fetch'
import { TranslationStatus } from '@crowdin/crowdin-api-client';
import { customFields, languageCodes, productCodes, productGroups } from './constants.mjs';
import pool from '../database/databaseConfig.mjs';

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


export async function getAllCards() {     

    try {
        const response = await fetch(`https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}`, {
            method: 'GET'
        })
        return response.json()

    } catch (error) {
        console.log(`getAllCards: ${error.message}`)
    }
}


export async function getTrelloProducts(cards) {

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

    const productCode = product.productCode;
    
    // FAST LOOKUP: Returns array of group names, or empty array if not found
    const mediaType = groupLookup.get(productCode) || [];

    return {
        mediaType: mediaType,
        wordCount: wordCount,
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

export async function upsertProducts(products) {

  for (const product of products) {

    // Upsert into products table (full transient state)
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
      product.mediaInfo?.mediaType ?? null,
      product.mediaInfo?.wordCount ?? null
    ])

    // If completed, upsert into completions table
    if (product.productStatus === 'completed') {
      await pool.query(`
        INSERT INTO completions (
          title, productCode, targetLang,
          mediaType, wordCount, datePublished
        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (title) DO UPDATE SET
          wordCount     = EXCLUDED.wordCount,
          datePublished = EXCLUDED.datePublished,
          mediaType     = EXCLUDED.mediaType
      `, [
        product.title,
        product.productCode,
        product.targetLang,
        product.mediaInfo?.mediaType ?? null,
        product.mediaInfo?.wordCount ?? null,
        product.lastActivity ?? null
      ])
    }
  }
}

export async function archiveProducts(activeTitles) {
  // Remove from products table
  await pool.query(`
    DELETE FROM products
    WHERE title != ALL($1)
  `, [activeTitles])

  // Set dateArchived in completions for anything no longer active
  await pool.query(`
    UPDATE completions
    SET dateArchived = NOW()
    WHERE dateArchived IS NULL
    AND title != ALL($1)
  `, [activeTitles])
}