import type { RawTrelloCard } from "../../shared/types.js";
import { ActiveCard, type ArchivedCard } from "../classes.js";
import { getCard, parseProducts, getActiveIds } from "../services/trelloFunctions.js";


const result = await getActiveIds()
console.log(result)