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
    console.log(`"Querying completions: ${lang}, ${code}, ${group}, ${from}, ${to}`)

    const groupArray = group ? group.split(',') : null // split language group array if present

    try {
        const result = await pool.query(`
        SELECT 
            SUM(wordcount) AS "totalWords",
            COUNT(*) AS "totalProducts"
        FROM completions
        WHERE
            ($1::text IS NULL OR targetlang = $1)
            AND ($2::text IS NULL OR productcode = $2)
            const groupArray = group ? group.split(',') : null
            AND ($3::date IS NULL OR datepublished >= $4)
            AND ($4::date IS NULL OR datepublished <= $5)
    `, [lang ?? null, code ?? null, groupArray, from ?? null, to ?? null])

    res.json(result.rows[0])
        
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

export default router;