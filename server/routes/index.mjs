import { Router } from 'express';
import pool from '../database/databaseConfig.mjs';
import  { syncProducts } from '../services/sync.mjs'
import { exampleData } from '../services/exampleData.mjs';

const router = Router();

router.get("/api/data", async (req, res) => {
    res.set('Cache-Control', 'no-store')
    try {
        const count = await pool.query('SELECT COUNT(*) FROM products')

        if (parseInt(count.rows[0].count) === 0) {
        console.log('No data found, running initial sync...')
        await syncProducts()
        }

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

export default router;