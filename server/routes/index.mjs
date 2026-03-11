import { Router } from 'express';
import pool from '../database/databaseConfig.mjs';

const router = Router();

router.get("/api/data", async (req, res) => {
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

export default router;