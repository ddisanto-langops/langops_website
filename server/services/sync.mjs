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

    console.log('Syncing products...')

    /*
      Download all active cards on board,
      regardless of date or any status.
      Filtering is done in following steps.
    */
    const activeCards = await getActiveCards()
    console.log(`Fetched ${activeCards.length} active cards from board.`)
    

    /*
      function getTrelloProducts acts as a filter.
      It determines which downloaded (active) cards are products.
      See products.mjs to inspect the logic directly.
      Product code and word count are derived from the title via regex matching.
      A card will be skipped under the following conditions:
        1) no product code exists;
        2) product code doesn't match those in constants.js;
        3) the card is set as a template in Trello
      Due date, last activity and Trello URL are then extracted directly from card JSON.
      Target language is then derived by iterating through the IDs of the card labels.
      Crowdin URL is derived from card attachments, if present.
      Published (bool) and Crowdin file and project IDs (number) are established by
      inspecting the card's custom fields for an ID defined in constants.
      Finally, media type is determined by comparing:
        1) product code (from title);
        2) card labels to the groups defined in the mediaGroups constant.
    */
    const trelloProducts = getTrelloProducts(activeCards)
    console.log(`Found ${trelloProducts.length} products.`)



    /*
      function getProductData determines the product 'status' seen in the UI,
      and adds translation progress data when available.
      It calls getCrowdinFileProgress() and getProductStatus(), respectively.
      If either Crowdin file or project ID are missing, getCrowdinFileProgress() is never called.
      getProductStatus() can return one of 3 statuses:
        1) Product is marked as published: returns 'published';
        2) Product has Trello activitly within the last 7 days, 
          or translation progress greater than 0: 'pending';
        3) Neither of the above: 'unknown'
    */
    const enrichedProducts = await getProductData(trelloProducts)
    console.log(`Added data to ${enrichedProducts.length} products.`)

    /*
      After filtering, active products are added to 'products' database.
    */ 
    await upsertProducts(enrichedProducts)
    console.log("Active products added to database.")

    /*
      Delete products from the 'products' databse,
      if their title isn't found in the latest API data.
    */ 
    const activeTitles = enrichedProducts.map(p => p.title)
    await archiveProducts(activeTitles)
    console.log(`Synced ${enrichedProducts.length} products`)


    /*
      Get all archived cards since since yesterday.
      This is a second Trello API call, 
      filtering for cards archived up to one day ago.
    */
    const archivedCards = await getArchivedCards()
    console.log(`Fetched ${archivedCards.length} archived cards from board.`)

    /*
      The same logic as above determines which archived cards
      represent valid products, as opposed to clutter.
    */
    const archivedTrelloProducts = getTrelloProducts(archivedCards)
    console.log(`Found ${archivedTrelloProducts.length} archived products.`)

    /*
      All valid products added to 'completions' database
    */ 
    await upsertArchivedProducts(archivedTrelloProducts)
    console.log("Archived products added to database.")


  } catch (error) {
    console.error(`Sync failed: ${error.message}`)
  }
}

// Run every 30 minutes
cron.schedule('*/30 * * * *', syncProducts)