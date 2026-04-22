import fetch from 'node-fetch'
import { getTrelloProducts } from './products.mjs'
import pool from '../database/databaseConfig.mjs'

const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;

console.log('Environment check:')
console.log(`  TrelloBoardId: ${trelloBoardId ? '✓ set' : '✗ missing'}`)
console.log(`  TrelloKey: ${trelloKey ? '✓ set' : '✗ missing'}`)
console.log(`  TrelloToken: ${trelloToken ? '✓ set' : '✗ missing'}`)

async function getAllArchivedCards() {
    let allCards = []
    let page = 0
    const cardsPerPage = 50

    console.log('Fetching archived cards from 2025-01-01 with pagination...')

    while (true) {
        try {
            // Use since parameter to limit to data from 2025-01-01 onwards
            const url = `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,url,isTemplate&since=2025-01-01&page=${page}&pageSize=${cardsPerPage}`
            console.log(`Fetching page ${page}...`)
            
            const response = await fetch(url, { method: 'GET' })
            
            if (!response.ok) {
                const text = await response.text()
                console.error(`Error (status ${response.status}): ${text.substring(0, 200)}`)
                break
            }

            const pageCards = await response.json()
            
            if (!Array.isArray(pageCards) || pageCards.length === 0) {
                console.log(`Reached end of results at page ${page}`)
                break
            }

            console.log(`  Got ${pageCards.length} cards on page ${page}`)
            allCards = allCards.concat(pageCards)
            page++
            
            // Rate limit: wait a bit between requests
            await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
            console.error(`Error fetching page ${page}: ${error.message}`)
            break
        }
    }

    return allCards
}

async function backfillTrelloUrls() {
    console.log('Fetching all archived cards for backfill...')
    const archivedCards = await getAllArchivedCards()
    console.log(`Fetched ${archivedCards.length} archived cards.`)

    const archivedTrelloProducts = getTrelloProducts(archivedCards)
    if (!archivedTrelloProducts) {
        console.error('getTrelloProducts returned undefined')
        return
    }
    console.log(`Parsed ${archivedTrelloProducts.length} valid archived products.`)

    let updateCount = 0
    for (const product of archivedTrelloProducts) {
        if (!product.trelloUrl) continue

        try {
            const result = await pool.query(`
                UPDATE completions
                SET trello_url = $1
                WHERE title = $2 AND trello_url IS NULL
                RETURNING title
            `, [product.trelloUrl, product.title])
            
            if (result.rows.length > 0) {
                console.log(`Updated: ${product.title}`)
                updateCount++
            }
        } catch (error) {
            console.error(`Error updating ${product.title}: ${error.message}`)
        }
    }

    console.log(`\nBackfill complete. Updated ${updateCount} rows with trello_url.`)
}

backfillTrelloUrls()
