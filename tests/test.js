import { getAllCards } from "../Documents/Dev/langops_website/server/services/products.mjs";
import { getTrelloProducts } from "../Documents/Dev/langops_website/server/services/products.mjs";

console.log("Getting products...")
try {
  const cards  = await getAllCards()
  console.log(`Found ${cards.length} cards.`)
  const products = getTrelloProducts(cards)
  console.log(`Found ${products.length} products.`)
} catch (error) {
  console.log(error.message)
}
