import { TrelloAdapter } from "../services/adapters/trelloAdapter.js"
import { TrelloProductFactory } from "../classes.js"
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

const trelloBoardId = process.env.trelloBoardId ?? null
const trelloKey = process.env.trelloKey ?? null
const trelloToken = process.env.trelloToken ?? null

if (trelloBoardId && trelloKey && trelloToken) {
    const trelloAdapter = new TrelloAdapter(
        trelloBoardId, trelloKey, trelloToken
    )

    await trelloAdapter.getActiveCards()
    await trelloAdapter.getArchivedCards()
    await trelloAdapter.getActiveIds()

    const activeCards = trelloAdapter.activeCards ?? null
    const archivedCards = trelloAdapter.archivedCards ?? null
    const activeIds = trelloAdapter.activeIds ?? null

    if (activeCards) {
        const activeCardFactory = new TrelloProductFactory(activeCards)
        await activeCardFactory.getTrelloDataSchema()
        const activeProducts = activeCardFactory.trelloData
    }

    if (archivedCards) {
        const archivedCardFactory = new TrelloProductFactory(archivedCards)
        await archivedCardFactory.getTrelloDataSchema()
        const archivedProducts = archivedCardFactory.trelloData
    }
    


}
