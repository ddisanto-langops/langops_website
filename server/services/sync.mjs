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
    const trelloProducts = await getTrelloProducts(cards)
    const products = await getProductData(trelloProducts)

    await upsertProducts(products)

    const activeTitles = products.map(p => p.title)
    await archiveProducts(activeTitles)

    console.log(`Synced ${products.length} products`)

  } catch (error) {
    console.error(`Sync failed: ${error.message}`)
  }
}

// Run every 30 minutes
cron.schedule('*/30 * * * *', syncProducts)