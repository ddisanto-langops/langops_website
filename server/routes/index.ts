import { Router } from 'express';
import pool from '../database/databaseConfig.js';
import { deleteCompletion, editCompletion, getActiveProducts, getCompletions, getCount, getProductCount } from '../services/syncFunctions.js';
import type { ApiFilters, ArchivedProduct } from '../../shared/types.js';

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
    
    try {
        const tableData = await getCompletions(filters)
        res.json(tableData)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/admin/completions: Unknown error" })
    }
})

router.put('/api/completions/:id', async (req, res) => {
    const { id } = req.params
    const { title, productCode, targetLanguage, mediaGroups, wordCount, datePublished, dateArchived } = req.body
    const record: Partial<ArchivedProduct> = {
        title: title,
        productCode: productCode,
        targetLanguage: targetLanguage,
        mediaGroups: mediaGroups,
        wordCount: wordCount,
        datePublished: datePublished,
        dateArchived: dateArchived
    }
     
    try {
        const response = await editCompletion(id, record )

        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json(response.rows)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PUT /api/admin/completions/:id: Unknown error" })
    }
})

// Delete a completion by id
router.delete('/api/completions/:id', async (req, res) => {
    const { id } = req.params

    try {
       const response = await deleteCompletion(id)
        
       if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json({ message: 'Deleted successfully', record: response.rows })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "DEL /api/admin/completions/:id: Unknown error" })
    }
})

export default router;