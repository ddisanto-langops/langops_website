import cron from 'node-cron'
import { getAllCards,
    getTrelloProducts,
    getProductData,
    upsertProducts,
    archiveProducts 
} from '../services/products.mjs'


export async function syncProducts() {
  try {
    console.log('Syncing products...')

    const cards = await getAllCards()
    console.log(`Fetched ${cards.length} cards from board.`)

    const trelloProducts = getTrelloProducts(cards)
    console.log(`Found ${trelloProducts.length} products.`)

    const products = await getProductData(trelloProducts)
    console.log(`Added data to ${products.length} products.`)

    await upsertProducts(products)
    console.log("Products added to database.")

    const activeTitles = products.map(p => p.title)
    await archiveProducts(activeTitles)
    console.log(`Synced ${products.length} products`)

  } catch (error) {
    console.error(`Sync failed: ${error.message}`)
  }
}

// Run every 30 minutes
cron.schedule('*/30 * * * *', syncProducts)