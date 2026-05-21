import type { ActiveProduct, ApiFilters, ArchivedProduct, RawTrelloCard, IdmlStorageRecord } from "../../shared/types.js"
import { productCodes, supportedLanguages } from "../../shared/constants.js"
import { ActiveCard, ArchivedCard } from "../classes.js";
import pool from '../database/databaseConfig.js';
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

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
        `https://api.trello.com/1/cards/${id}?key=${trelloKey}&token=${trelloToken}&fields=name,dateLastActivity,due,url,dateClosed&actions=all&attachments=true&attachment_fields=all&customFieldItems=true`, {
            headers: {
                accept: 'application-json'
            },
            method: 'GET'
        }
    )
    const card: RawTrelloCard = await response.json() as RawTrelloCard
    return card
}

export async function getActiveIds(): Promise<{id: string}[]> {
    const response = await fetch(`https://api.trello.com/1/boards/${trelloBoardId}/cards?filter=visible&fields=id&key=${trelloKey}&token=${trelloToken}`,{
        headers: {
            accept: 'application-json'
        },
        method: 'GET'
    })
    const activeIds = await response.json() as {id: string}[]
    return activeIds
}

export async function getlocalizedTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching article title. Status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('h1.text-left').contents().filter((_, node) => node.nodeType === 3).text().trim();    

    return title;

  } catch (error) {
    console.error('Scraping failed:', error);
    return 'NOT FOUND';
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
        if (!productCodes.includes(card.productCode)) {
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
            continue
        } else if (!card.datePublished && mode === "archived") {
            console.log(`Skipped: ${card.title} | Reason: In mode "Archived" but missing date published`)
            continue
        } else {
            console.log(`Accepted: ${card.title}`)
        }
        
        if (card instanceof ActiveCard) {
            const product = await card.parseActiveCard()
            products.push(product)
        } else if (card instanceof ArchivedCard) {
            const product = await card.parseArchivedCard()
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
        const response = await pool.query(`
            INSERT INTO completions (
                id, title, localized_title, product_code, target_language,
                media_groups, wordcount, date_published, trello_url,
                article_url, editor_url, date_archived
            )
            SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            WHERE NOT EXISTS (
                SELECT 1 FROM deletions WHERE deletions.id = $1
            )
            ON CONFLICT (id) DO UPDATE SET
                title            = EXCLUDED.title,
                localized_title  = EXCLUDED.localized_title,
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
            product.localizedTitle,
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


// GET /api/products 
export async function getActiveProducts(): Promise<ActiveProduct[]> {
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
export async function getCompletions(): Promise<ArchivedProduct[]> {
    const request = await pool.query(`
        SELECT
            id,
            title,
            localized_title     AS "localizedTitle",
            product_code        AS "productCode",
            target_language     AS "targetLanguage",
            media_groups        AS "mediaGroups",
            wordcount           AS "wordCount",
            date_published      AS "datePublished",
            date_archived       AS "dateArchived",
            trello_url          AS "trelloUrl",
            editor_url          AS "editorUrl",
            article_url         AS "articleUrl",
            COUNT(*) OVER()     AS total_count
        FROM completions
        ORDER BY date_archived DESC
        `)
    
    return request.rows
}


// GET /api/completions/filter
export async function getFilteredCompletions(filters: ApiFilters): Promise<{data: ArchivedProduct[], totalCount: number, page: number, pageSize: number}> {
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
            localized_title     AS "localizedTitle",
            product_code        AS "productCode",
            target_language     AS "targetLanguage",
            media_groups        AS "mediaGroups",
            wordcount           AS "wordCount",
            date_published      AS "datePublished",
            date_archived       AS "dateArchived",
            trello_url          AS "trelloUrl",
            editor_url          AS "editorUrl",
            article_url         AS "articleUrl",
            COUNT(*) OVER()     AS total_count
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
            localized_title = $2,
            product_code = $3,
            target_language = $4,
            media_groups = $5::text[],
            wordcount = $6,
            date_published = $7,
            date_archived = $8,
            editor_url = $9,
            article_url = $10
        WHERE id = $11
        RETURNING
            id,
            title,
            localized_title     AS "localizedTitle",
            product_code        AS "productCode",
            target_language     AS "targetLanguage",
            media_groups        AS "mediaGroups",
            wordcount           AS "wordCount",
            date_published      AS "datePublished",
            date_archived       AS "dateArchived",
            editor_url          AS "editorUrl",
            article_url         AS "articleUrl",
            trello_url          AS "trelloUrl"
        `, [
            record.title,
            record.localizedTitle || null,
            record.productCode, 
            record.targetLanguage, 
            record.mediaGroups, 
            record.wordCount, 
            record.datePublished || null, 
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
            product_status = $3,
            target_language = $4,
            media_groups = $5::text[],
            wordcount = $6,
            published = $7,
            due_date = $8,
            date_last_activity = $9,
            date_published = $10,
            translation_progress = $11,
            approval_progress = $12,
            editor_url = $13,
            article_url = $14,
            crowdin_url = $15
        WHERE id = $16
        RETURNING 
            id,
            title,
            product_code AS "productCode",
            product_status AS "productStatus",
            target_language AS "targetLanguage",
            media_groups AS "mediaGroups",
            wordcount AS "wordCount",
            published,
            due_date AS "dueDate",
            date_last_activity AS "dateLastActivity",
            date_published AS "datePublished",
            translation_progress AS "translationProgress",
            approval_progress AS "approvalProgress",
            editor_url AS "editorUrl",
            article_url AS "articleUrl",
            crowdin_url AS "CrowdinUrl",
            trello_url AS "trelloUrl"
        `, [
            record.title, 
            record.productCode,
            record.productStatus,
            record.targetLanguage, 
            record.mediaGroups, 
            record.wordCount,
            record.published,
            record.dueDate,
            record.dateLastActivity,
            record.datePublished,
            record.translationProgress,
            record.approvalProgress,
            record.editorUrl,
            record.articleUrl,
            record.crowdinUrl,
            id
        ]
    )
    return response
}

/*
 * Hard delete; assumes products which are no longer active
 * have been archived and will be found in completions on next sync. 
 * Avoids moving record to 'deletions' database because that could cause an
 * ID collision, and becaue 'deletions' is for records which would otherwise
 * be difficult to recover via Trello.
*/ 
export async function deleteProducts(idsArray: {id: string}[]) {
    const flattenedIds = idsArray.map(item => item.id)
    if (flattenedIds.length === 0) {
        console.log("No active cards returned from Trello. Aborting delete to protect data.");
        return { deletedCount: 0 };
    }
    const query = await pool.query(`
        DELETE FROM products 
        WHERE NOT (id = ANY($1))
        RETURNING id;
        `,
        [flattenedIds]
    )
    return {deletedCount: query.rowCount}
}


// Soft delete (moves to 'deleted' database)
export async function deleteCompletion(id: string) {
    const response = await pool.query(`
        WITH moved_record AS (
            DELETE FROM completions
            WHERE id = $1
            RETURNING 
            id, title, localized_title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        )
        INSERT INTO deletions (
            id, title, localized_title, product_code, 
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
            id, title, localized_title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        )
        INSERT INTO completions (
            id, title, localized_title, product_code, 
            target_language, media_groups, 
            wordcount, date_published, date_archived, 
            trello_url, article_url, editor_url
        ) 
        SELECT * FROM moved_record
        RETURNING *;
    `, [id])

    return response
}

/*
 * IDML Storage
 * Stores original IDML files, their parse output ZIPs,
 * and rebuilt IDML files after Crowdin reconstruction.
 */

export async function saveIdmlRecord(
    fileName: string,
    idmlData: Buffer,
    xliffZipData: Buffer,
    crowdinProjectId: string,
    crowdinProjectName: string,
    targetLanguage: string,
    crowdinFileIds: number[]
): Promise<number> {
    const result = await pool.query(`
        INSERT INTO idml_storage
            (file_name, idml_data, xliff_zip_data, crowdin_project_id, crowdin_project_name, target_language, crowdin_file_ids)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `, [fileName, idmlData, xliffZipData, crowdinProjectId, crowdinProjectName, targetLanguage, JSON.stringify(crowdinFileIds)])
    return result.rows[0].id as number
}

export async function listIdmlRecords(): Promise<IdmlStorageRecord[]> {
    const result = await pool.query(`
        SELECT
            id,
            file_name            AS "fileName",
            crowdin_project_id   AS "crowdinProjectId",
            crowdin_project_name AS "crowdinProjectName",
            target_language      AS "targetLanguage",
            crowdin_file_ids     AS "crowdinFileIds",
            status,
            created_at           AS "createdAt",
            updated_at           AS "updatedAt"
        FROM idml_storage
        ORDER BY created_at DESC
    `)
    return result.rows
}

export async function getIdmlRecordData(id: number): Promise<{
    fileName: string
    idmlData: Buffer
    xliffZipData: Buffer
    crowdinProjectId: string
    targetLanguage: string
    crowdinFileIds: number[]
} | null> {
    const result = await pool.query(`
        SELECT
            file_name          AS "fileName",
            idml_data          AS "idmlData",
            xliff_zip_data     AS "xliffZipData",
            crowdin_project_id AS "crowdinProjectId",
            target_language    AS "targetLanguage",
            crowdin_file_ids   AS "crowdinFileIds"
        FROM idml_storage
        WHERE id = $1
    `, [id])
    return result.rows[0] ?? null
}

export async function completeIdmlRecord(id: number, rebuiltData: Buffer): Promise<void> {
    await pool.query(`
        UPDATE idml_storage
        SET status = 'complete', rebuilt_idml_data = $2, updated_at = NOW()
        WHERE id = $1
    `, [id, rebuiltData])
}

export async function getRebuiltIdml(id: number): Promise<{ data: Buffer; fileName: string } | null> {
    const result = await pool.query(`
        SELECT rebuilt_idml_data AS data, file_name AS "fileName"
        FROM idml_storage
        WHERE id = $1 AND status = 'complete'
    `, [id])
    return result.rows[0] ?? null
}

export async function deleteIdmlRecord(id: number): Promise<void> {
    await pool.query(`DELETE FROM idml_storage WHERE id = $1`, [id])
}


export async function getGlobalSearchData(filters: ApiFilters) {
    
    
}