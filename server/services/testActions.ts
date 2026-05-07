import type { RawTrelloCard } from "../../shared/types.js"
import {
    parseActiveCards
} from "./products.js"
import response from "../../response.json" with { type: 'json'}

const cards = response as unknown as RawTrelloCard[]
const results = await parseActiveCards(cards)

console.log(JSON.stringify(results))