import fs from "fs";

import { getAllCards } from "../server/services/products.mjs";
import { getTrelloProducts } from "../server/services/products.mjs";

console.log("Getting products...")
try {
  const cards  = await getAllCards()
  console.log(`Found ${cards.length} cards.`)
  const products = JSON.stringify(getTrelloProducts(cards))
  console.log(`Found ${products.length} products.`)
  fs.writeFile("../server/tests/products.json", products, (error) => {

    console.log("File written successfully.")
    

    
    if (error) {
      console.log(error)
      return;
    }

  })
} catch (error) {
  console.log(error.message)
}

