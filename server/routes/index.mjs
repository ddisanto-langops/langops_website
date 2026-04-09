import { Router } from 'express';
import pool from '../database/databaseConfig.mjs';

const router = Router();

router.get("/api/data", async (req, res) => {
    console.log("Querying transient data...")
    try {
        const result = await pool.query(`
        SELECT 
            title,
            productcode AS "productCode",
            targetlang AS "targetLang",
            productstatus AS "productStatus",
            crowdinurl AS "crowdinUrl",
            trellourl AS "trelloUrl",
            due,
            lastactivity AS "lastActivity",
            published,
            translationprog AS "translationProg",
            approvalprog AS "approvalProg",
            mediatype AS "mediaType",
            wordcount AS "wordCount"
        FROM products
        ORDER BY lastactivity DESC NULLS LAST
        `)
        res.json(result.rows)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
    })

router.get('/api/completions', async (req, res) => {
    const { lang, code, group, from, to } = req.query
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
        res.status(500).json({error: error.message})
    }
})


router.get("/api/data/completions/byproduct", async (req, res) => {
    const { lang, code, group, from, to } = req.query
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
        res.status(500).json({error: error.message})
    }
})


router.get('/api/admin/completions', async (req, res) => {
    const { lang, code, group, from, to } = req.query

    try {
        const result = await pool.query(`
            SELECT
                id,
                title,
                productcode AS "productCode",
                targetlang AS "targetLang",
                mediatype AS "mediaType",
                wordcount AS "wordCount",
                datepublished AS "datePublished",
                datearchived AS "dateArchived"
            FROM completions
            WHERE
                ($1::text IS NULL OR targetlang = $1)
                AND ($2::text IS NULL OR productcode = $2)
                AND ($3::text IS NULL OR $3 = ANY(mediatype))
                AND ($4::date IS NULL OR datepublished >= $4)
                AND ($5::date IS NULL OR datepublished <= $5)
            ORDER BY datepublished DESC NULLS LAST
        `, [lang ?? null, code ?? null, group ?? null, from ?? null, to ?? null])

        res.json(result.rows)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

router.put('/api/admin/completions/:id', async (req, res) => {
    const { id } = req.params
    const { title, productCode, targetLang, mediaType, wordCount, datePublished, dateArchived } = req.body
    
     const mediaTypeArray = Array.isArray(mediaType) && mediaType.length > 0
        ? mediaType.filter(Boolean)
        : null
    
    try {
        const result = await pool.query(`
            UPDATE completions
            SET title = $1,
                productcode = $2,
                targetlang = $3,
                mediatype = $4::text[],
                wordcount = $5,
                datepublished = $6,
                datearchived = $7
            WHERE id = $8
            RETURNING *
        `, [title, productCode, targetLang, mediaTypeArray, wordCount, datePublished, dateArchived, id])

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json(result.rows[0])

    } catch (error) {
        res.status(500).json({ error: error.message })
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
        res.status(500).json({ error: error.message })
    }
})

export default router;
