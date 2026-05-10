import { Router } from 'express';
import pool from '../database/databaseConfig.js';

const router = Router();

function getQueryString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined
}

router.get("/api/data", async (req, res) => {
    console.log("Querying transient data...")
    try {
        const result = await pool.query(`
        SELECT 
            id,
            title,
            product_code,
            targetlang AS "targetLang",
            productstatus AS "productStatus",
            crowdinurl AS "crowdinUrl",
            trellourl AS "trelloUrl",
            article_url AS "articleUrl",
            editor_url AS "editorUrl",
            due,
            lastactivity AS "lastActivity",
            published,
            date_published AS "datePublished",
            translationprog AS "translationProg",
            approvalprog AS "approvalProg",
            mediatype AS "mediaType",
            wordcount AS "wordCount"
        FROM products
        ORDER BY lastactivity DESC NULLS LAST
        `)
        res.json(result.rows)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/data: Unknown error" })
    }
})

/*
    This is the route for the dashboard page,
    providing product completion stats as opposed
    to the detailed table view found on
    the completions page.
*/
router.get('/api/completions', async (req, res) => {
    const lang = getQueryString(req.query.lang)
    const code = getQueryString(req.query.code)
    const group = getQueryString(req.query.group)
    const from = getQueryString(req.query.from)
    const to = getQueryString(req.query.to)
    console.log(`"Querying completions: Lang: ${lang}, Code: ${code}, Media Group: ${group}, From: ${from}, To: ${to}`)

    try {
        const result = await pool.query(`
        SELECT 
            SUM(wordcount) AS "totalWords",
            COUNT(*) AS "totalProducts"
        FROM completions
        WHERE
            ($1::text IS NULL OR targetlang = $1)
            AND ($2::text IS NULL OR productcode = $2)
            AND ($3::text IS NULL OR $3::text = ANY(mediatype))
            AND ($4::date IS NULL OR datepublished >= $4)
            AND ($5::date IS NULL OR datepublished <= $5)
    `, [lang ?? null, code ?? null, group, from ?? null, to ?? null]);
    
    const data = result.rows[0];
    const responseData = {
        totalWords: Number(data.totalWords),
        totalProducts: Number(data.totalProducts)
    };
    res.json(responseData);
        
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/completions: Unknown error" })
    }
})


router.get("/api/data/completions/byproduct", async (req, res) => {
    const lang = getQueryString(req.query.lang)
    const code = getQueryString(req.query.code)
    const group = getQueryString(req.query.group)
    const from = getQueryString(req.query.from)
    const to = getQueryString(req.query.to)
    try {
        const result = await pool.query(`
            SELECT productcode, count(*) AS occurence_count
            FROM completions
            WHERE
                ($1::text IS NULL OR targetlang = $1)
                AND ($2::text IS NULL OR productcode = $2)
                AND ($3::text IS NULL OR $3::text = ANY(mediatype))
                AND ($4::date IS NULL OR datepublished >= $4)
                AND ($5::date IS NULL OR datepublished <= $5)
            GROUP BY productcode;`,
            [lang ?? null, code ?? null, group, from ?? null, to ?? null]
        );
        
        res.json(result.rows);

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/data/completions/byproduct: Unknown error" })
    }
})

/*
    This endpoint is for the detailed completions
    page, as opposed to the dashboard which also
    queries the completions database.
*/
router.get('/api/admin/completions', async (req, res) => {
    const lang = getQueryString(req.query.lang)
    const code = getQueryString(req.query.code)
    const group = getQueryString(req.query.group)
    const from = getQueryString(req.query.from)
    const to = getQueryString(req.query.to)
    const title = getQueryString(req.query.title)
    const page = getQueryString(req.query.page) ?? '1'
    const limit = getQueryString(req.query.limit) ?? '50'
    const sortBy = getQueryString(req.query.sortBy)
    const sortDir = getQueryString(req.query.sortDir)

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50))
    const offset = (pageNum - 1) * limitNum

    const allowedSortColumns = {
        title: 'title',
        productCode: 'productcode',
        targetLang: 'targetlang',
        datePublished: 'datepublished',
        wordCount: 'wordcount',
    } as const
    const sortColumn = sortBy && sortBy in allowedSortColumns
        ? allowedSortColumns[sortBy as keyof typeof allowedSortColumns]
        : 'datepublished'
    const sortDirection = sortDir === 'asc' ? 'ASC' : 'DESC'

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
                ($1::text IS NULL OR targetlang ILIKE '%' || $1 || '%')
                AND ($2::text IS NULL OR productcode ILIKE '%' || $2 || '%')
                AND ($3::text IS NULL OR $3 = ANY(mediatype))
                AND ($4::date IS NULL OR datepublished >= $4)
                AND ($5::date IS NULL OR datepublished <= $5)
                AND ($6::text IS NULL OR title ILIKE '%' || $6 || '%')
            ORDER BY ${sortColumn} ${sortDirection} NULLS LAST
            LIMIT $7 OFFSET $8
        `, [lang ?? null, code ?? null, group ?? null, from ?? null, to ?? null, title ?? null, limitNum, offset])

        const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count, 10) : 0
        const data = result.rows.map(({ total_count, ...row }) => row)

        res.json({ data, totalCount, page: pageNum, pageSize: limitNum })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/admin/completions: Unknown error" })
    }
})

router.put('/api/admin/completions/:id', async (req, res) => {
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
                mediaGroups = $4::text[],
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
router.delete('/api/admin/completions/:id', async (req, res) => {
    const { id } = req.params

    try {
        const result = await pool.query(`
            DELETE FROM completions
            WHERE id = $1
            RETURNING *
        `, [id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json({ message: 'Deleted successfully', record: result.rows[0] })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "DEL /api/admin/completions/:id: Unknown error" })
    }
})

export default router;
