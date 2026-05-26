import type { ActiveProduct, ApiFilters, ArchivedProduct, RawTrelloCard } from '../../shared/types.js';
import multer from 'multer';
import { Router } from 'express';
import { 
    deleteCompletion, 
    editCompletion, 
    getActiveProducts, 
    getCard, 
    getCompletions,
    getDeletions,
    getFilteredCompletions,
    getFilteredAllProducts,
    getCount, 
    getProductCount, 
    restoreCompletion,
    parseProducts,
    editProduct,
    saveIdmlRecord,
    listIdmlRecords,
    getIdmlRecordData,
    completeIdmlRecord,
    getRebuiltIdml,
    deleteIdmlRecord,
    permanentDelete,
} from '../services/functions.js';

const router = Router();

const idmlServiceSecret = process.env.IdmlServiceSecret ?? ""
const IdmlServiceId = process.env.IdmlServiceId ?? ""

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
            res.status(500).json({ error: "GET /api/products: Unknown error" })
    }
})


router.get("/api/completions", async (req, res) => {
    try {
        const archivedProducts = await getCompletions()
        res.json(archivedProducts)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/completions: Unknown error" })
    }
})

router.get("/api/deletions", async (_req, res) => {
    try {
        const deletedRecords = await getDeletions()
        res.json(deletedRecords)
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/deletions: Unknown error" })
    }
})

/*
 * GET /api/completions/wordcount
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
            res.status(500).json({ error: "GET /api/completions/wordcount: Unknown error" })
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
router.get('/api/completions/filter', async (req, res) => {
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
        const tableData = await getFilteredCompletions(filters)
        res.json(tableData)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "GET /api/completions: Unknown error" })
    }
})

/*
 * Unified paginated endpoint returning both active and archived products.
 * Used by the AllProducts table on the search page.
 */
router.get('/api/all-products/filter', async (req, res) => {
    const filters: ApiFilters = {
        lang: getQueryString(req.query.lang),
        code: getQueryString(req.query.code),
        group: getQueryString(req.query.group),
        from: getQueryString(req.query.from),
        to: getQueryString(req.query.to),
        title: getQueryString(req.query.title),
        source: getQueryString(req.query.source),
        page: Number(getQueryString(req.query.page)) || 1,
        limit: Number(getQueryString(req.query.limit) || '50'),
        sortBy: getQueryString(req.query.sortBy),
        sortDir: getQueryString(req.query.sortDir),
    }

    try {
        const tableData = await getFilteredAllProducts(filters)
        res.json(tableData)
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: 'GET /api/all-products/filter: Unknown error' })
    }
})

// edit completion
router.put('/api/completions/:id', async (req, res) => {
    const { id } = req.params
    const { title, localizedTitle, productCode, targetLanguage, mediaGroups, wordCount, datePublished, dateArchived, editorUrl, articleUrl } = req.body
    const record: Partial<ArchivedProduct> = {
        title: title,
        localizedTitle: localizedTitle,
        productCode: productCode,
        targetLanguage: targetLanguage,
        mediaGroups: mediaGroups,
        wordCount: wordCount,
        datePublished: datePublished ?? null,
        dateArchived: dateArchived,
        editorUrl: editorUrl,
        articleUrl: articleUrl
    }
     
    try {
        const response = await editCompletion(id, record )

        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json(response.rows)

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PUT /api/completions/:id: Unknown error" })
    }
})

// Delete a completion by id
router.delete('/api/completions/delete/:id', async (req, res) => {
    const { id } = req.params

    try {
       const response = await deleteCompletion(id)
        
       if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json({ message: 'Deleted successfully', record: response.rows })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "DEL /api/completions/:id: Unknown error" })
    }
})

// restore a completion via its ID
router.put('/api/completions/restore/:id', async (req, res) => {
    const { id } = req.params

    try {
        const response = await restoreCompletion(id)
        
        if (response.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' })
        }

        res.json({ message: 'Restored successfully', record: response.rows })

    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PUT /api/completions/restore/:id: Unknown error" })
    }
})

router.put('/api/resync/:id/:mode', async (req, res) => {
    const { id, mode } = req.params

    try {
        const card: RawTrelloCard = await getCard(id)
        
        if (mode === "active") {
            const product: ActiveProduct[] = await parseProducts([card], mode)
            const result = await editProduct(id, product[0])
            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Record not found' })
            } else {
                return res.json(result.rows) 
            }
        } else if ( mode === "archived") {
            const product: ArchivedProduct[] = await parseProducts([card], mode)
            if (product[0]) {
                const result = await editCompletion(id, product[0])
                if (result.rowCount === 0) {
                    return res.status(404).json({ error: 'Record not found' })
                } else {
                    return res.json(result.rows)
                }
            }
            
        } 
    } catch (error) {
        error instanceof Error ? res.status(500).json({ error: error.message }) :
            res.status(500).json({ error: "PUT /api/updatecard: Unknown error" })
    }
})


/*
 *  Route for uploading XLIFFs to Crowdin after parsing IDML
*/
const upload = multer({ storage: multer.memoryStorage() }); // keep file in RAM, don't write to disk
const CROWDIN_TOKEN = process.env.crowdinToken!

router.post('/api/crowdin/upload', upload.single('xliff'), async (req, res) => {
    const { projectId, fileName } = req.body;
    const fileBuffer = req.file?.buffer;

    if (!fileBuffer || !projectId || !fileName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Step A: upload to Crowdin Storage → get a storageId
        const storageRes = await fetch('https://api.crowdin.com/api/v2/storages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CROWDIN_TOKEN}`,
                'Crowdin-API-FileName': fileName,
                'Content-Type': 'application/octet-stream',
            },
            body: new Uint8Array(fileBuffer)
        });
        if (!storageRes.ok) throw new Error('Crowdin storage upload failed');
        const { data: storageData } = await storageRes.json();
        const storageId: number = storageData.id;

        // Step B: add the file to the Crowdin project using the storageId
        const fileRes = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}/files`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CROWDIN_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ storageId, name: fileName }),
        });
        if (!fileRes.ok) {
            const err = await fileRes.json();
            throw new Error(err.errors?.[0]?.error?.message ?? 'Crowdin file creation failed');
        }
        const { data: fileData } = await fileRes.json();
        res.json({ crowdinFileId: fileData.id }); // you can store this back in your DB

    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' });
    }
});


router.post('/api/idml/parse', upload.single('idml'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });    
    const sourceLang = req.body.source_lang ?? 'fr';
    const fileBuffer = req.file.buffer;
    const originalName = req.file.originalname;

    const form = new FormData();
    form.append('idml', new Blob([new Uint8Array(fileBuffer)]), originalName);
    form.append('source_lang', sourceLang);

    const headers = new Headers() 
    headers.append("CF-Access-Client-Id", IdmlServiceId )
    headers.append("CF-Access-Client-Secret", idmlServiceSecret)

    const upstream = await fetch('https://idml.pcglangops.com/parse', {
        headers: headers,
        method: 'POST',
        body: form 
    });
    if (!upstream.ok) {
        const { error } = await upstream.json();
        return res.status(502).json({ error });
    }

    const zip = await upstream.arrayBuffer();
    res.setHeader('Content-Type', 'application/zip');
    res.send(Buffer.from(zip));
});


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


/*
 * GET /api/idml/storage
 * List all stored IDML records (metadata only, no binary data).
 */
router.get('/api/idml/storage', async (_req, res) => {
    try {
        const records = await listIdmlRecords()
        res.json(records)
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})


/*
 * POST /api/idml/storage
 * Save a new IDML record after parse + Crowdin upload.
 * Expects multipart: idml file, xliffZip file, plus body fields.
 */
router.post('/api/idml/storage', upload.fields([{ name: 'idml', maxCount: 1 }, { name: 'xliffZip', maxCount: 1 }]), async (req, res) => {
    const files = req.files as Record<string, Express.Multer.File[]> | undefined
    const idmlBuffer = files?.['idml']?.[0]?.buffer
    const xliffZipBuffer = files?.['xliffZip']?.[0]?.buffer
    const { fileName, projectId, projectName, targetLanguage, crowdinFileIds } = req.body

    if (!idmlBuffer || !xliffZipBuffer || !fileName || !projectId || !targetLanguage || !crowdinFileIds) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        const parsedFileIds = JSON.parse(crowdinFileIds) as number[]
        const id = await saveIdmlRecord(
            fileName, idmlBuffer, xliffZipBuffer,
            projectId, projectName ?? '', targetLanguage, parsedFileIds
        )
        res.json({ id })
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})


/*
 * DELETE /api/idml/storage/:id
 * Permanently delete a stored IDML record and all its data.
 */
router.delete('/api/idml/storage/:id', async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })
    try {
        await deleteIdmlRecord(id)
        res.json({ message: 'Deleted' })
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})


/**
 * Hard delete of a record already in deletions table.
 * Corresponds to deletion button in UI.
 */
router.delete('/api/deletions/delete/:id', async (req, res) => {
    const id = req.params.id
    try {
        await permanentDelete(id)
        res.json({ message: 'Deleted' })
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})


/*
 * POST /api/idml/storage/:id/reconstruct
 * Fetches translated XLIFFs from Crowdin, rebuilds the IDML,
 * and stores the result. Updates status to 'complete' on success.
 */
router.post('/api/idml/storage/:id/reconstruct', async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })

    try {
        const record = await getIdmlRecordData(id)
        if (!record) return res.status(404).json({ error: 'Record not found' })

        const { idmlData, xliffZipData, crowdinProjectId, targetLanguage, crowdinFileIds, fileName } = record

        // Download each translated XLIFF from Crowdin
        const translatedXliffs: { name: string; data: Buffer }[] = []

        for (const fileId of crowdinFileIds) {
            // Export file translation — synchronous, returns a direct download URL
            const exportRes = await fetch(
                `https://api.crowdin.com/api/v2/projects/${crowdinProjectId}/translations/builds/files/${fileId}`,
                {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${CROWDIN_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targetLanguageId: targetLanguage })
                }
            )
            if (!exportRes.ok) {
                const err = await exportRes.json() as { errors?: { error: { message: string } }[] }
                throw new Error(err.errors?.[0]?.error?.message ?? `Failed to export file ${fileId}`)
            }
            const exportBody = await exportRes.json() as { data: { url: string } }
            if (!exportBody.data?.url) throw new Error(`No download URL returned for file ${fileId}`)

            // Download the translated XLIFF directly
            const xliffRes = await fetch(exportBody.data.url)
            if (!xliffRes.ok) throw new Error(`Failed to download translated XLIFF for file ${fileId}`)
            const xliffBuffer = Buffer.from(await xliffRes.arrayBuffer())

            // Get file name from Crowdin
            const fileInfoRes = await fetch(
                `https://api.crowdin.com/api/v2/projects/${crowdinProjectId}/files/${fileId}`,
                { headers: { 'Authorization': `Bearer ${CROWDIN_TOKEN}` } }
            )
            if (!fileInfoRes.ok) throw new Error(`Failed to fetch file info for file ${fileId}`)
            const fileInfoBody = await fileInfoRes.json() as { data: { name: string } }
            translatedXliffs.push({ name: fileInfoBody.data.name, data: xliffBuffer })
        }

        // Build new ZIP: translated XLIFFs + style_map.json from the original parse ZIP
        const JSZip = (await import('jszip')).default
        const originalZip = await JSZip.loadAsync(xliffZipData)
        const styleMapEntry = originalZip.file('style_map.json')
        if (!styleMapEntry) throw new Error('style_map.json not found in stored ZIP')
        const styleMapData = await styleMapEntry.async('nodebuffer')

        const newZip = new JSZip()
        newZip.file('style_map.json', styleMapData)
        for (const xliff of translatedXliffs) {
            newZip.file(xliff.name, xliff.data)
        }
        const newZipBuffer = await newZip.generateAsync({ type: 'nodebuffer' })

        // Send to the IDML reconstruct service
        const form = new FormData()
        form.append('idml', new Blob([new Uint8Array(idmlData)]), fileName)
        form.append('xliffs', new Blob([new Uint8Array(newZipBuffer)]), 'xliff_out.zip')

        const headers = new Headers()
        headers.append("CF-Access-Client-Id", IdmlServiceId )
        headers.append("CF-Access-Client-Secret", idmlServiceSecret)
        const upstreamRes = await fetch('https://idml.pcglangops.com/reconstruct', { 
            method: 'POST',
            headers: headers,
            body: form 
        })
        if (!upstreamRes.ok) {
            const { error } = await upstreamRes.json() as { error: string }
            throw new Error(error)
        }
        const rebuiltBuffer = Buffer.from(await upstreamRes.arrayBuffer())

        await completeIdmlRecord(id, rebuiltBuffer)
        res.json({ message: 'Reconstruction complete' })

    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})


/*
 * GET /api/idml/storage/:id/download
 * Stream the rebuilt IDML file to the client.
 */
router.get('/api/idml/storage/:id/download', async (req, res) => {
    const id = Number(req.params.id)
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' })
    try {
        const record = await getRebuiltIdml(id)
        if (!record) return res.status(404).json({ error: 'Record not found or reconstruction not yet complete' })
        const baseName = record.fileName.replace(/\.idml$/i, '')
        res.setHeader('Content-Type', 'application/octet-stream')
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}_rebuilt.idml"`)
        res.send(record.data)
    } catch (e) {
        res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
    }
})


export default router;