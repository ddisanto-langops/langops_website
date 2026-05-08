import { BaseCard, ActiveCard, ArchivedCard } from "../classes.js"
import type { RawTrelloCard } from "../../shared/types.js"
import response from "../../response.json" with { type: 'json'}

const cards = response as unknown as RawTrelloCard[]

/*
const activeProducts = []
for (const card of cards) {
    const newCard = await new ActiveCard(card).parseActiveCard()
    activeProducts.push(newCard)
}
console.log(activeProducts)
*/

const archivedProducts = []
for (const card of cards) {
    const newCard = new ArchivedCard(card).parseArchivedCard()
    archivedProducts.push(newCard)
}
console.log(archivedProducts)