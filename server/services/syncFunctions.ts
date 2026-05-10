import type { ActiveProduct, ArchivedProduct, RawTrelloCard } from "../../shared/types.js"
import { productCodes, targetLanguages } from "../../shared/constants.js"
import { ActiveCard, ArchivedCard } from "../classes.js";
import pool from '../database/databaseConfig.js';
import fetch from 'node-fetch'


const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;

/*
* Trello
*/

export async function getActiveCards(): Promise<RawTrelloCard[]> {
    if (!trelloBoardId || !trelloKey || !trelloToken) throw new Error("Missing credentials!")
        
    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true&actions=all&since=2026-05-05`,
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

export async function getArchivedCards(since?: string) {
    if (!trelloBoardId || !trelloKey || !trelloToken) throw new Error("Missing credentials!")

    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0]

    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&since=${since ? since : yesterday}`,
            { method: 'GET' }
        )
        if (!response.ok) {
            throw new Error(`Trello API error: ${response.statusText}`)
        }
        const cards: RawTrelloCard[] = await response.json() as RawTrelloCard[]
        return cards
    } catch (error) {
        error instanceof Error ? console.log(`Get Arhived Cards: ${error.message}`) :
            console.log("Get Archived Cards: Unknown  error")
        return []
    }
}

/*
 * Product Factory
 * This function creates products from raw cards.
 * It also applies logical tests to filter out 
 * cards which do not meet business logic requirements.
 * A card will be skipped under the following conditions:
 *   1) no product code exists;
 *   2) product code isn't supported;
 *   3) the card is a template;
 *   4) the target language is not one of the supported languages;
 *   5) the "Exclude" checkbox is checked.
*/
export async function parseProducts(rawCards: RawTrelloCard[], mode: "active"): Promise<ActiveProduct[]>
export async function parseProducts(rawCards: RawTrelloCard[], mode: "archived"): Promise<ArchivedProduct[]>
export async function parseProducts(rawCards: RawTrelloCard[], mode: "active" | "archived"): Promise<(ActiveProduct | ArchivedProduct)[]> {
    const products = []
    for (const item of rawCards) {
        const getCard = () => {
            if (mode === "active") {
                return new ActiveCard(item)
            } else {
                return new ArchivedCard(item)
            }
        }
        const card = getCard()
        const cardCustomFields = card.getCustomFields()
        if (!card.productCode) {
            console.log(`Skipped: ${card.title} | Reason: Missing product code`)
            continue
            } else if (!productCodes.includes(card.productCode)) {
            console.log(`Skipped: ${card.title} | Reason: Product code invalid or not yet supported`)
            continue
            } else if (card.isTemplate) {
            console.log(`Skipped: ${card.title} | Reason: Card is a template`)
            continue
            } else if (!card.targetLanguage || !targetLanguages.includes(card.targetLanguage)) {
            console.log(`Skipped: ${card.title} | Reason: Missing target language`)
            continue
            } else if (cardCustomFields.exclude) {
            console.log(`Skipped: ${card.title} | Reason: 'Exclude' box is checked`)
            continue
            }
        
        if (card instanceof ActiveCard) {
            const product = await card.parseActiveCard()
            products.push(product)
        } else if (card instanceof ArchivedCard) {
            const product = card.parseArchivedCard()
            products.push(product)
        }
    }
    return products
}


/*
* Database
*/

export async function upsertProducts(products: ActiveProduct[]) {
    for (const product of products) {
        await pool.query(`
            INSERT INTO products (
                id, title, product_code, target_language, product_status,
                crowdin_url, trello_url, article_url,
                editor_url, due_date, date_last_activity,
                published, date_published, translation_progress, 
                approval_progress, media_groups, wordcount
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
            ON CONFLICT (id) DO UPDATE SET
                title                   = EXCLUDED.title,
                product_code            = EXCLUDED.product_code,
                target_language         = EXCLUDED.target_language,
                product_status          = EXCLUDED.product_status,
                crowdin_url             = EXCLUDED.crowdin_url,
                trello_url              = EXCLUDED.trello_url,
                editor_url              = EXCLUDED.editor_url,
                article_url             = EXCLUDED.article_url,
                due_date                = EXCLUDED.due_date,
                date_last_activity      = EXCLUDED.date_last_activity,
                published               = EXCLUDED.published,
                date_published          = EXCLUDED.date_published,
                translation_progress    = EXCLUDED.translation_progress,
                approval_progress       = EXCLUDED.approval_progress,
                media_groups            = EXCLUDED.media_groups,
                wordcount               = EXCLUDED.wordcount
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
            product.dateLastActivity,
            product.published,
            product.datePublished ?? null,
            product.translationProgress,
            product.approvalProgress,
            product.mediaGroups,
            product.wordCount ?? null
        ])
    }
}

export async function upsertArchivedProducts(archivedProducts: ArchivedProduct[]) {
    for (const product of archivedProducts) {
        if (!product.datePublished) continue //WARNING: products archived but not published will disappear.
        await pool.query(`
            INSERT INTO completions (
                id, title, product_code, target_language,
                media_groups, wordcount, date_published, trello_url,
                article_url, editor_url, date_archived
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, $10, $11)
            ON CONFLICT (id) DO UPDATE SET
                id               = EXCLUDED.id,
                target_language  = EXCLUDED.target_language,
                product_code     = EXCLUDED.product_code,
                article_url      = EXCLUDED.article_url,
                editor_url       = EXCLUDED.editor_url,
                trello_url       = EXCLUDED.trello_url,
                date_archived    = EXCLUDED.date_archived
        `, [
            product.id,
            product.title,
            product.productCode,
            product.targetLanguage,
            product.mediaGroups ?? null,
            product.wordCount ?? null,
            product.trelloUrl,
            product.articleUrl ?? null,
            product.editorUrl ?? null,
            product.dateArchived ?? null
        ])
    }
}

export async function removeFromProducts(activeIds: string[]) {
    await pool.query(`
        DELETE FROM products
        WHERE id != ALL($1)
    `, [activeIds])

    await pool.query(`
        UPDATE completions
        SET date_archived = NOW()
        WHERE date_archived IS NULL
        AND id != ALL($1)
    `, [activeIds])
}