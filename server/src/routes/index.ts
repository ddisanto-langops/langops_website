import { Router, Request } from "express"
import { LangOpsApiClient } from "../langopsApiClient.js";
import type { GetProductFilters, LangOpsProduct, ProductMetaFilters } from "@shared/types"
import { Client, Credentials, CrowdinValidationError, CrowdinError } from "@crowdin/crowdin-api-client"

const router = Router()
const client = new LangOpsApiClient()

function extractMultiple(req: Request, key: string) {
    let args: string[] = []
    const reqArgs = req.query[key]
    if (Array.isArray(reqArgs)) {
        args = reqArgs.map(String)
    } else if (typeof reqArgs === "string") {
        args = [reqArgs]
    }
    return args
}

function buildGetProductFilters(req: Request): GetProductFilters {
    const filters: GetProductFilters = {
            targetLanguages: extractMultiple(req, "targetLanguages"),
            dateFrom: req.query.dateFrom?.toString(),
            dateTo: req.query.dateTo?.toString(),
            productCodes: extractMultiple(req, "productCodes"),
            mediaGroups: extractMultiple(req, "mediaGroups"),
            search: req.query.search?.toString(),
            limit: Number(req.query.limit) ? Number(req.query.limit) : undefined,
            offset: Number(req.query.offset) ? Number(req.query.offset): undefined,
            status: extractMultiple(req, "status")
        }
    return filters
}


function builProductMetaFilters(req: Request): ProductMetaFilters {
    const filters: ProductMetaFilters = {
            targetLanguages: extractMultiple(req, "targetLanguages"),
            dateFrom: req.query.dateFrom?.toString(),
            dateTo: req.query.dateTo?.toString(),
            productCodes: extractMultiple(req, "productCodes"),
            mediaGroups: extractMultiple(req, "mediaGroups")
    }

    return filters
}


router.get("/api/crowdin/projects", async (req, res) => {
    try {
        if (process.env.crowdinToken) {
            const credentials: Credentials = {
                token: process.env.crowdinToken
            }
            const crowdinClient = new Client(credentials)

            const response = await crowdinClient.projectsGroupsApi.listProjects()
            res.json(response.data) 
        } else {
            throw new Error("Unable to fetch Crowdin projects: no Crowdin token")
        }
        
    } catch (error) {
        if (error instanceof CrowdinError || error instanceof CrowdinValidationError) {
            return res.status(error.code).json({
                error: error.message
            })
        }
    }
})

router.get("/api/crowdin/files/:projectId", async (req, res) => {
    const projectId = Number(req.params.projectId)
    try {
        if (process.env.crowdinToken) {
            const credentials: Credentials = {
                token: process.env.crowdinToken
            }
            const crowdinClient = new Client(credentials)

            const response = await crowdinClient.sourceFilesApi.listProjectFiles(projectId)
            res.json(response.data) 
        } else {
            throw new Error("Unable to fetch Crowdin files: no Crowdin token")
        }
        
    } catch (error) {
        if (error instanceof CrowdinError || error instanceof CrowdinValidationError) {
            return res.status(error.code).json({
                error: error.message
            })
        }
    }
})


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