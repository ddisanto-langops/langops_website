import type { RawTrelloCard } from '../../shared/types.js'
import {
  getActiveCards,
  getArchivedCards,
  upsertProducts,
  upsertArchivedProducts,
  parseProducts,
  getActiveIds,
  deleteProducts,
} from './syncFunctions.js'
import cron from 'node-cron'

export async function syncProducts() {
  try {
    /*
    * Download all active cards on board,
    *  regardless of date.
    * Filtering is done in following steps.
    */
    console.log('\nSyncing active products...')
    const activeCards: RawTrelloCard[] = await getActiveCards()
    console.log(`\nFetched ${activeCards.length} active cards from board.`)

    const activeTrelloProducts = await parseProducts(activeCards, "active")
    console.log(`\nFound ${activeTrelloProducts.length} active products.`)

    await upsertProducts(activeTrelloProducts)
    console.log("\nActive products added to database.")

    /*
     * Get active IDs from board and delete from products
     * if the ID isn't found on the board anymore.
    */ 
    const activeIds = await getActiveIds()
    const deleted = await deleteProducts(activeIds)
    console.log(`\nRemoved ${deleted.deletedCount} items from products database.`)


    /*
      Get all archived cards since since yesterday.
      This is a second Trello API call, 
      filtering for cards archived up to one day ago.
    */
    console.log("\nSyncing archived products...")
    const archivedCards: RawTrelloCard[] = await getArchivedCards()
    console.log(`Fetched ${archivedCards.length} archived cards from board.`)

    const archivedTrelloProducts = await parseProducts(archivedCards, "archived")
    console.log(`\nFound ${archivedTrelloProducts.length} archived products.`)

    /*
    * All valid products added to 'completions' database
    */ 
    await upsertArchivedProducts(archivedTrelloProducts)
    console.log("\nArchived products added to database.")


  } catch (error) {
    error instanceof Error ? console.error(`Sync failed: ${error.message}`) :
      console.error("\nSync archived products: unknown error")
  }
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', syncProducts)