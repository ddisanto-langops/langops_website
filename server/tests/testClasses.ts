import { BaseCard, ActiveCard, ArchivedCard } from "../classes.js"
import type { RawTrelloCard } from "../../shared/types.js"
//import response from "../../response.json" with { type: 'json'}
import { parseProducts, getActiveCards, getArchivedCards } from "../services/trelloFunctions.js"
import { parse } from "node:path"

//const cards = response as unknown as RawTrelloCard[]

/*
try {
    const products = await parseProducts(cards, "active")
    console.log(products)
} catch (error) {
    error instanceof Error ? console.log(`testClasses error: ${error.message}`)
        : console.log("Unknown error")
}
*/
/*
const cards = await getActiveCards("2026-05-22")
try {
    const activeProducts = await parseProducts(cards, "active")
    console.log(activeProducts)
} catch (error) {
    error instanceof Error ? console.log(`testClasses error: ${error.message}`)
        : console.log("Unknown error")
}
*/
const cards = await getArchivedCards("2026-05-22")
try {
    const archivedProducts = await parseProducts(cards, "archived")
    console.log(archivedProducts)
} catch (error) {
    error instanceof Error ? console.log(`testClasses error: ${error.message}`)
        : console.log("Unknown error")
}

