import type { RawTrelloCard } from "../../shared/types.js";
import { ActiveCard, type ArchivedCard } from "../classes.js";
import { getCard, getCustomFields, parseProducts } from "../services/syncFunctions.js";


const card: RawTrelloCard = await getCard("6a049da34fb1f9ab2e386fb6")
const product = await parseProducts([card], "active")
console.log(product)