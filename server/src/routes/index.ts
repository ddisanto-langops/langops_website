import { Router, Request } from "express"
import { LangOpsApiClient } from "../langopsApiClient.js";
import type { GetProductFilters, LangOpsProduct, ProductMetaFilters } from "@shared/types"

const router = Router()
const client = new LangOpsApiClient()

function extractMediaGroups(req: Request) {
    let mediaGroups: string[] = []
    const reqMediaGroups = req.query.mediaGroups
    if (Array.isArray(reqMediaGroups)) {  
        mediaGroups = reqMediaGroups.map(String)
    } else if (typeof reqMediaGroups === "string") {
        mediaGroups = [reqMediaGroups]
    }
    return mediaGroups    
}

function extractStatuses(req: Request) {
    let statuses: string[] = []
    const reqStatuses = req.query.status
    if (Array.isArray(reqStatuses)) {
        statuses = reqStatuses.map(String)
    } else if (typeof reqStatuses === "string") {
        statuses = [reqStatuses]
    }
    return statuses
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
            status: extractStatuses(req)
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




export default router;