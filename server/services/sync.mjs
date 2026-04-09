import cron from 'node-cron'
import { getActiveCards,
    getArchivedCards,
    getTrelloProducts,
    getProductData,
    upsertProducts,
    upsertArchivedProducts,
    archiveProducts,

} from '../services/products.mjs'


export async function syncProducts() {
  try {

    /*
    Active Cards
    */

    console.log('Syncing products...')

    // get all cards
    const activeCards = await getActiveCards()
    console.log(`Fetched ${activeCards.length} active cards from board.`)
    
    // determine which are products
    const trelloProducts = getTrelloProducts(activeCards)
    console.log(`Found ${trelloProducts.length} products.`)

    // enrich product info via Crowdin, date calculation, etc.
    const enrichedProducts = await getProductData(trelloProducts)
    console.log(`Added data to ${enrichedProducts.length} products.`)

    // upsert active products to database
    await upsertProducts(enrichedProducts)
    console.log("Active products added to database.")

    // determine if any products need to be moved to archive
    const activeTitles = enrichedProducts.map(p => p.title)
    await archiveProducts(activeTitles)
    console.log(`Synced ${enrichedProducts.length} products`)


    /*
    Archived cards
    */
    // get all archived cards since a specified date
    const archivedCards = await getArchivedCards()
    console.log(`Fetched ${activeCards.length} archived cards from board.`)

    // determine which are products
    const archivedTrelloProducts = getTrelloProducts(archivedCards)
    console.log(`Found ${archivedTrelloProducts.length} archived products.`)

    // upsert archived products to completions database
    await upsertArchivedProducts(archivedTrelloProducts)
    console.log("Archived products added to database.")


  } catch (error) {
    console.error(`Sync failed: ${error.message}`)
  }
}

// Run every 30 minutes
cron.schedule('*/30 * * * *', syncProducts)