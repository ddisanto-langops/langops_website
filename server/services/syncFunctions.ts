import type { ActiveProduct, ApiFilters, ArchivedProduct, RawTrelloCard } from "../../shared/types.js"
import { productCodes, supportedLanguages } from "../../shared/constants.js"
import { ActiveCard, ArchivedCard } from "../classes.js";
import pool from '../database/databaseConfig.js';
import fetch from 'node-fetch'


const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;

/*
* Trello
*/

export async function getActiveCards(since?: string): Promise<RawTrelloCard[]> {
    if (!trelloBoardId || !trelloKey || !trelloToken) throw new Error("Get active cards: missing credentials")
    
    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0]

    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
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
    if (!trelloBoardId || !trelloKey || !trelloToken) throw new Error("Get archived cards: missing credentials!")
    
    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0]

    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
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

// Used for refreshing card data on demand in the UI
export async function getCard(id: string): Promise<RawTrelloCard> {
    const response = await fetch(
        `https://api.trello.com/1/cards/${id}?key=${trelloKey}&token=${trelloToken}&fields=name,dateLastActivity,due,url&actions=all&attachments=true&attachment_fields=all&customFieldItems=true`, {
            headers: {
                accept: 'application-json'
            },
            method: 'GET'
        }
    )
    const card: RawTrelloCard = await response.json() as RawTrelloCard
    return card
}

// Used for refreshing card data on demand in the UI
export async function getCustomFields(id: string) {
    const response = await fetch(
        `https://api.trello.com/1/cards/${id}/customFieldItems?key=${trelloKey}&token=${trelloToken}`, {
            headers: {
                accept: 'application-json'
            },
            method: 'GET'
        }
    )
    const card = await response.json()
    return card
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
            } else if (cardCustomFields.exclude) {
            console.log(`Skipped: ${card.title} | Reason: 'Exclude' box is checked`)
            continue
            } else if (!card.targetLanguage || !supportedLanguages.includes(card.targetLanguage) ) {
                console.log(`Skipped: ${card.title} | Reason: Target language missing or not yet supported (got '${card.targetLanguage}')`)
            } else {
                console.log(`Accepted: ${card.title}`)
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
        const response = await pool.query(`
            INSERT INTO completions (
                id, title, product_code, target_language,
                media_groups, wordcount, date_published, trello_url,
                article_url, editor_url, date_archived
            )
            SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
            WHERE NOT EXISTS (
                SELECT 1 FROM deletions WHERE deletions.id = $1
            )
            ON CONFLICT (id) DO UPDATE SET
                target_language  = EXCLUDED.target_language,
                product_code     = EXCLUDED.product_code,
                article_url      = EXCLUDED.article_url,
                editor_url       = EXCLUDED.editor_url,
                trello_url       = EXCLUDED.trello_url,
                date_archived    = EXCLUDED.date_archived
            RETURNING id, (xmax = 0) AS is_insert
        `, [
            product.id,
            product.title,
            product.productCode,
            product.targetLanguage,
            product.mediaGroups ?? null,
            product.wordCount ?? null,
            product.datePublished,
            product.trelloUrl,
            product.articleUrl ?? null,
            product.editorUrl ?? null,
            product.dateArchived ?? null
        ])
        if (response.rowCount === 0) {
            console.log(`Skipped insertion: ${product.title} | Reason: is deleted`)
        }
    }
}

export async function removeFromProducts(activeIds: string[]) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const deleteRes = await client.query(`
            DELETE FROM products
            WHERE id != ALL($1)
            RETURNING id
        `, [activeIds]);

        const updateRes = await client.query(`
            UPDATE completions
            SET date_archived = NOW()
            WHERE date_archived IS NULL
            AND id != ALL($1)
            RETURNING id
        `, [activeIds]);

        await client.query('COMMIT');

        return {
            deletedCount: deleteRes.rowCount,
            archivedCount: updateRes.rowCount
        };

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transaction failed, changes rolled back:', error);
        throw error;
    } finally {
        // Always release the client back to the pool
        client.release();
    }
}


// GET /api/products 
export async function getActiveProducts() {
    const request = await pool.query(`
        SELECT 
            id,
            title,
            product_code,
            target_language AS "targetLanguage",
            product_status AS "productStatus",
            crowdin_url AS "crowdinUrl",
            trello_url AS "trelloUrl",
            article_url AS "articleUrl",
            editor_url AS "editorUrl",
            due_date AS "dueDate",
            date_last_activity AS "dateLastActivity",
            published,
            date_published AS "datePublished",
            translation_progress AS "translationProgress",
            approval_progress AS "approvalProgress",
            media_groups AS "mediaGroups",
            wordcount AS "wordCount"
        FROM products
        ORDER BY date_last_activity DESC NULLS LAST
        `)
    
    return request.rows
}


// GET /api/completions
export async function getCompletions(filters: ApiFilters) {
    const pageNum = filters.page ? Math.max(1, filters.page) : 1
    const limitNum = Math.min(200, Math.max(1, filters.limit || 50))
    const offset = (pageNum - 1) * limitNum

    const allowedSortColumns = {
        title: 'title',
        productCode: 'product_code',
        targetLang: 'target_language',
        datePublished: 'date_published',
        wordCount: 'wordcount',
    } as const
    const sortColumn = filters.sortBy && filters.sortBy in allowedSortColumns
        ? allowedSortColumns[filters.sortBy as keyof typeof allowedSortColumns]
        : 'date_published'
    const sortDirection = filters.sortDir === 'asc' ? 'ASC' : 'DESC'

    const response = await pool.query(`
        SELECT
            id,
            title,
            product_code as "productCode",
            target_language as "targetLanguage",
            media_groups as "mediaGroups",
            wordcount as "wordCount",
            date_published AS "datePublished",
            date_archived AS "dateArchived",
            trello_url AS "trelloUrl",
            editor_url as "editorUrl",
            article_url as "articleUrl",
            COUNT(*) OVER() AS total_count
        FROM completions
        WHERE
            ($1::text IS NULL OR target_language ILIKE '%' || $1 || '%')
            AND ($2::text IS NULL OR product_code ILIKE '%' || $2 || '%')
            AND ($3::text IS NULL OR $3 = ANY(media_groups))
            AND ($4::date IS NULL OR date_published >= $4)
            AND ($5::date IS NULL OR date_published <= $5)
            AND ($6::text IS NULL OR title ILIKE '%' || $6 || '%')
        ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
        LIMIT $7 OFFSET $8
    `, [filters.lang ?? null, filters.code ?? null, filters.group ?? null, filters.from ?? null, filters.to ?? null, filters.title ?? null, limitNum, offset])

    const totalCount = response.rows.length > 0 ? parseInt(response.rows[0].total_count, 10) : 0
    const data = response.rows.map(({ total_count, ...row }) => row)
    
    return { data, totalCount, page: pageNum, pageSize: limitNum }
}

// GET /api/completions/wordcount
export async function getCount(filters: Partial<ApiFilters>) {
    const request = await pool.query(`
        SELECT 
            SUM(c.wordcount) AS "totalWords",
            COUNT(c.*) AS "totalProducts",
            SUM(p.wordcount) FILTER (WHERE p.published IS TRUE) AS "totalPublishedProductWords"
        FROM completions c
        LEFT JOIN products p ON c.product_code = p.product_code
        WHERE
            ($1::text IS NULL OR c.target_language = $1)
            AND ($2::text IS NULL OR c.product_code = $2)
            AND ($3::text IS NULL OR $3::text = ANY(c.media_groups))
            AND ($4::date IS NULL OR c.date_published >= $4)
            AND ($5::date IS NULL OR c.date_published <= $5)
        `, [
            filters.lang ?? null, 
            filters.code ?? null, 
            filters.group, 
            filters.from ?? null, 
            filters.to ?? null
        ]
    );
    const count = {
            totalWords: Number(request.rows[0].totalWords),
            totalProducts: Number(request.rows[0].totalProducts)
        };
    return count
}


// GET /api/completions/byproduct
export async function getProductCount(filters: Partial<ApiFilters>) {
    const response = await pool.query(`
        SELECT product_code, COUNT(*) AS occurence_count
        FROM (
            SELECT product_code
            FROM completions
            WHERE
                ($1::text IS NULL OR target_language = $1)
                AND ($2::text IS NULL OR product_code = $2)
                AND ($3::text IS NULL OR $3::text = ANY(media_groups))
                AND ($4::date IS NULL OR date_published >= $4)
                AND ($5::date IS NULL OR date_published <= $5)

            UNION ALL

            SELECT product_code
            FROM products
            WHERE
                published IS TRUE
                AND ($1::text IS NULL OR target_language = $1)
                AND ($2::text IS NULL OR product_code = $2)
                AND ($3::text IS NULL OR $3::text = ANY(media_groups))
                AND ($4::date IS NULL OR date_published >= $4)
                AND ($5::date IS NULL OR date_published <= $5)
        ) AS matching_records
        GROUP BY product_code;`,
        [
            filters.lang ?? null, 
            filters.code ?? null, 
            filters.group, 
            filters.from ?? null, 
            filters.to ?? null
        ]
    );
    return response.rows
}

// PUT /api/completions/:id
export async function editCompletion(id: string, record: Partial<ArchivedProduct>) {
    
    const response = await pool.query(`
        UPDATE completions
        SET title = $1,
            product_code = $2,
            target_language = $3,
            media_groups = $4::text[],
            wordcount = $5,
            date_published = $6,
            date_archived = $7,
            editor_url = $8,
            article_url = $9
        WHERE id = $10
        RETURNING *
        `, [
            record.title, 
            record.productCode, 
            record.targetLanguage, 
            record.mediaGroups, 
            record.wordCount, 
            record.datePublished, 
            record.dateArchived,
            record.editorUrl,
            record.articleUrl,
            id
        ]
    )
    return response
}

export async function editProduct(id: string, record: Partial<ActiveProduct>) {
    
    const response = await pool.query(`
        UPDATE products
        SET title = $1,
            product_code = $2,
            target_language = $3,
            media_groups = $4::text[],
            wordcount = $5,
            date_published = $6,
            editor_url = $7,
            article_url = $8
        WHERE id = $9
        RETURNING *
        `, [
            record.title, 
            record.productCode, 
            record.targetLanguage, 
            record.mediaGroups, 
            record.wordCount, 
            record.datePublished,
            record.editorUrl,
            record.articleUrl,
            id
        ]
    )
    return response
}

export async function deleteCompletion(id: string) {
    const response = await pool.query(`
        WITH moved_record AS (
            DELETE FROM completions
            WHERE id = $1
            RETURNING 
            id, title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        )
        INSERT INTO deletions (
            id, title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        ) 
        SELECT * FROM moved_record
        RETURNING *;
    `, [id])

    return response
}

export async function restoreCompletion(id: string) {
    const response = await pool.query(`
        WITH moved_record AS (
            DELETE FROM deletions
            WHERE id = $1
            RETURNING 
            id, title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        )
        INSERT INTO completions (
            id, title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        ) 
        SELECT * FROM moved_record
        RETURNING *;
    `, [id])

    return response
}