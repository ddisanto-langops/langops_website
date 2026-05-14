import type { RawTrelloCard } from "../../shared/types.js";
import { ActiveCard, type ArchivedCard } from "../classes.js";
import { getCard, parseProducts } from "../services/syncFunctions.js";


const card: RawTrelloCard = await getCard("69eb9c1765eeca2822d1d467")
//const product = await parseProducts([card], "archived")
console.log(JSON.stringify(card))