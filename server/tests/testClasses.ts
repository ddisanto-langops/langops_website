import { BaseCard } from "../../shared/classes.js"
import type { RawTrelloCard } from "../../shared/types.js"
import response from "../../response.json" with { type: 'json'}

const cards = response as unknown as RawTrelloCard[]

const card = new BaseCard(cards[15])

console.log(JSON.stringify(card.parse()))