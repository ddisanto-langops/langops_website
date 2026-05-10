import type { ActiveProduct, ArchivedProduct, RawTrelloCard } from '../../shared/types.js'
import { ActiveCard, ArchivedCard } from '../classes.js'
import { productCodes, targetLanguages } from '../../shared/constants.js'
import {
  getActiveCards,
  getArchivedCards,
  upsertProducts,
  upsertArchivedProducts,
  removeFromProducts,
  parseProducts,
} from './syncFunctions.js'
import cron from 'node-cron'
import { parse } from 'node:path'

export async function syncProducts() {
  try {

    console.log('Syncing products...')

    /*
    * Download all active cards on board,
    *  regardless of date.
    * Filtering is done in following steps.
    */
    const activeCards: RawTrelloCard[] = await getActiveCards()
    console.log(`Fetched ${activeCards.length} active cards from board.`)

    const activeTrelloProducts = await parseProducts(activeCards, "active")
    console.log(`Found ${activeTrelloProducts.length} active products.`)

    await upsertProducts(activeTrelloProducts)
    console.log("Active products added to database.")

    /*
      Delete products from the 'products' databse,
      if their id isn't found in the latest API data.
    */ 
    const activeIds: string[] = activeTrelloProducts.map(p => p.id)
    await removeFromProducts(activeIds)
    console.log(`Removed ${activeIds.length} items from products database.`)


    /*
      Get all archived cards since since yesterday.
      This is a second Trello API call, 
      filtering for cards archived up to one day ago.
    */
    const archivedCards: RawTrelloCard[] = await getArchivedCards()
    console.log(`Fetched ${archivedCards.length} archived cards from board.`)

    const archivedTrelloProducts = await parseProducts(archivedCards, "archived")
    console.log(`Found ${archivedTrelloProducts.length} archived products.`)

    /*
    * All valid products added to 'completions' database
    */ 
    await upsertArchivedProducts(archivedTrelloProducts)
    console.log("Archived products added to database.")


  } catch (error) {
    error instanceof Error ? console.error(`Sync failed: ${error.message}`) :
      console.error("Sync archived products: unknown error")
  }
}

// Run every 5 minutes
cron.schedule('*/5 * * * *', syncProducts)