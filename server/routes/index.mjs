import { Router } from 'express';
import pool from '../database/databaseConfig.mjs';
import { exampleData } from '../services/exampleData.mjs';

const router = Router();

router.get("/api/data", async (req, res) => {
    
    try {
        const result = await pool.query(
        `
        SELECT * FROM products
        ORDER BY lastActivity DESC NULLS LAST
        `)
        res.json(result.rows)
        
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

export default router;