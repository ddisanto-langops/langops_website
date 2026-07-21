import { Router, Request } from "express"
import { LangOpsApiClient } from "../langopsApiClient.js";
import type { GetProductFilters, LangOpsProduct, ProductMetaFilters } from "../../../shared/types.js";

const router = Router()
const client = new LangOpsApiClient()

function extractMediaGroups(req: Request) {
    const mediaGroups: string[] = []
    const reqMediaGroups = req.query.mediaGroups
    if (Array.isArray(reqMediaGroups)) {
        for (const item of reqMediaGroups) {
            if (typeof item === "string") {
                mediaGroups.push(item)
            }
        }
        return mediaGroups
    }
}

function buildGetProductFilters(req: Request): GetProductFilters {
    const filters: GetProductFilters = {
            targetLanguage: req.query.targetLanguage?.toString(),
            dateFrom: req.query.dateFrom?.toString(),
            dateTo: req.query.dateTo?.toString(),
            productCode: req.query.productCode?.toString(),
            mediaGroups: extractMediaGroups(req),
            search: req.query.search?.toString(),
            limit: Number(req.query.limit) ? Number(req.query.limit) : undefined,
            offset: Number(req.query.offset) ? Number(req.query.offset): undefined,
            archivedOnly: Boolean(req.query.archivedOnly),
            publishedOnly: Boolean(req.query.publishedOnly),
            unpublishedOnly: Boolean(req.query.unpublishedOnly),
            excludeDeleted: Boolean(req.query.excludeDeleted)
        }
    return filters
}


function builProductMetaFilters(req: Request): ProductMetaFilters {
    const filters: ProductMetaFilters = {
            targetLanguage: req.query.targetLanguage?.toString(),
            dateFrom: req.query.dateFrom?.toString(),
            dateTo: req.query.dateTo?.toString(),
            productCode: req.query.productCode?.toString(),
            mediaGroups: extractMediaGroups(req)
    }

    return filters
}



router.get("/api/products", async (req, res) => {
    try {

        const filters = buildGetProductFilters(req)

        const products = await client.getProducts(filters)
        res.json(products)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/products: Unknown error" })
    }
            
})


router.get('/api/products/wordcount', async (req, res) => {
    try {
        const filters = builProductMetaFilters(req)        
        const wordcount = await client.getWordCount(filters)
        res.json(wordcount);
        
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/products/wordcount: Unknown error" })
    }
})



router.get("/api/products/productcount", async (req, res) => {
    try {
        const filters = builProductMetaFilters(req)
        const productCount = await client.getProductCount(filters)
        res.json(productCount);

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/products/productcount: Unknown error" })
    }
})



router.patch('/api/products/edit/:id', async (req, res) => {
    try {
        const { id } = req.params
        const product = req.body as LangOpsProduct
        const response = await client.editProduct(id, product)
        res.json(response)
        
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PATCH /api/products/edit:id: Unknown error" })
    }
})


router.patch('/api/products/restore/:id', async (req, res) => {
    try {
        const { id } = req.params
        const response = await client.restoreProduct(id)
        res.json(response)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PATCH /api/completions/restore:id: Unknown error" })
    }
})


router.delete('/api/products/delete/:id', async (req, res) => {
    try {
       const { id } = req.params
       const response = await client.softDeleteProduct(id)
       res.json(response)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "DEL /api/products/delete:id: Unknown error" })
    }
})


router.delete('/api/products/permanent-delete/:id', async (req, res) => {
    try {
        const { id } = req.params
        const response = await client.permanentlyDeleteProduct(id)
        res.json(response)
    } catch (error) {
        error instanceof Error ? res.status(500).json({error: error.message}) :
            res.status(500).json({error: "DEL /api/products/permanent-delete:id: Unknown error"})
    }
})



/*
 * GET /api/crowdin/projects
 * Returns all Crowdin projects with their target languages.
*/
router.get('/api/crowdin/projects', async (_req, res) => {
    try {
        const projRes = await fetch('https://api.crowdin.com/api/v2/projects?limit=500', {
            headers: { 'Authorization': `Bearer ${CROWDIN_TOKEN}` }
        })
        if (!projRes.ok) throw new Error('Failed to fetch Crowdin projects')
        const body = await projRes.json() as { data: { data: { id: number; name: string; targetLanguages: { id: string; name: string }[] } }[] }
        const projects = body.data.map(p => ({
            id: p.data.id,
            name: p.data.name,
            targetLanguages: p.data.targetLanguages?.map(l => ({ id: l.id, name: l.name })) ?? []
        }))
        res.json(projects)
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})




export default router;