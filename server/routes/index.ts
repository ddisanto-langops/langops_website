import { Router } from 'express';
import pool from '../database/databaseConfig.js';
import { getActiveProducts, getCount, getProductCount } from '../services/syncFunctions.js';
import type { ApiFilters } from '../../shared/types.js';

const router = Router();

function getQueryString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined
}

router.get("/api/products", async (req, res) => {
    console.log("Querying transient data...")
    try {
        const activeProducts = await getActiveProducts()
        res.json(activeProducts)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/data: Unknown error" })
    }
})

/*
 * GET /api/completions
 * This is data is for the upper section (word count) 
 * of the dashboard page, counting completions and published products.
 * It is distinct from the detailed table view 
 * found on the completions page, and from the
 * byproduct endpoint which lists individual numbers of products.
*/
router.get('/api/completions/wordcount', async (req, res) => {

    const filters: Partial<ApiFilters> = {
        lang: getQueryString(req.query.lang),
        code: getQueryString(req.query.code),
        group: getQueryString(req.query.group),
        from: getQueryString(req.query.from),
        to: getQueryString(req.query.to)
    }
    console.log(`"Querying completions: Lang: ${filters.lang}, Code: ${filters.code}, Media Group: ${filters.group}, From: ${filters.from}, To: ${filters.to}`)

    try {
        const count = await getCount(filters)
    
        res.json(count);
        
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/completions: Unknown error" })
    }
})

/*
 * This is the lower part of the dashboard page
 * which provides totals by product code. 
*/
router.get("/api/completions/byproduct", async (req, res) => {
    const filters: Partial<ApiFilters> = {
        lang: getQueryString(req.query.lang),
        code: getQueryString(req.query.code),
        group: getQueryString(req.query.group),
        from: getQueryString(req.query.from),
        to: getQueryString(req.query.to)
    }
   
    try {
        const productCount = await getProductCount(filters)
        
        res.json(productCount);

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/data/completions/byproduct: Unknown error" })
    }
})

/*
 * This endpoint is for the detailed completions
 * table, as opposed to the dashboard which also
 * queries the completions database.
*/
router.get('/api/completions', async (req, res) => {
    const filters: ApiFilters = {
        lang: getQueryString(req.query.lang),
        code: getQueryString(req.query.code),
        group: getQueryString(req.query.group),
        from: getQueryString(req.query.from),
        to: getQueryString(req.query.to),
        title: getQueryString(req.query.title),
        page: Number(getQueryString(req.query.page)) ?? '1',
        limit: Number(getQueryString(req.query.limit) ?? '50'),
        sortBy: getQueryString(req.query.sortBy),
        sortDir: getQueryString(req.query.sortDir)
    }
    
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

    try {
        const result = await pool.query(`
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

        const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0
        const data = result.rows.map(({ total_count, ...row }) => row)

        res.json({ data, totalCount, page: pageNum, pageSize: limitNum })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/admin/completions: Unknown error" })
    }
})

router.put('/api/completions/:id', async (req, res) => {
    const { id } = req.params
    const { title, productCode, targetLanguage, mediaGroups, wordCount, datePublished, dateArchived } = req.body
    
     const mediaTypeArray = Array.isArray(mediaGroups) && mediaGroups.length > 0
        ? mediaGroups.filter(Boolean)
        : null
    
    try {
        const result = await pool.query(`
            UPDATE completions
            SET title = $1,
                product_code = $2,
                target_language = $3,
                media_groups = $4::text[],
                wordcount = $5,
                date_published = $6,
                date_archived = $7
            WHERE id = $8
            RETURNING *
        `, [title, productCode, targetLanguage, mediaTypeArray, wordCount, datePublished, dateArchived, id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json(result.rows[0])

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PUT /api/admin/completions/:id: Unknown error" })
    }
})

// Delete a completion by id
router.delete('/api/completions/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query(`
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

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json({ message: 'Deleted successfully', record: result.rows[0] })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "DEL /api/admin/completions/:id: Unknown error" })
    }
})

export default router;
