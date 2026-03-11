import { Router } from 'express';
import pool from '../database/databaseConfig.mjs';
import { exampleData } from '../services/exampleData.mjs';

const router = Router();

router.get("/api/data", async (req, res) => {
  try {
    const count = await pool.query('SELECT COUNT(*) FROM products')
    
    if (parseInt(count.rows[0].count) === 0) {
      console.log('No data found, running initial sync...')
      await syncProducts()
    }

    const result = await pool.query(`
      SELECT * FROM products
      ORDER BY lastactivity DESC NULLS LAST
    `)
    res.json(result.rows)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router;