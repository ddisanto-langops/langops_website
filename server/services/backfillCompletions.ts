import fetch from 'node-fetch'
import { parseProducts, getArchivedCards, upsertArchivedProducts } from './functions.js'

const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;

console.log('Environment check:')
console.log(`  TrelloBoardId: ${trelloBoardId ? '✓ set' : '✗ missing'}`)
console.log(`  TrelloKey: ${trelloKey ? '✓ set' : '✗ missing'}`)
console.log(`  TrelloToken: ${trelloToken ? '✓ set' : '✗ missing'}`)

const since = prompt('Enter the date (YYYY-MM-DD) to backfill archived products since (default: yesterday): ')

console.log(`Backfilling archived products since: ${since || 'yesterday'}`)

const archivedCards = await getArchivedCards(since ?? undefined)
console.log(`Fetched ${archivedCards.length} archived cards from board.`)

/*
  The same logic as above determines which archived cards
  represent valid products, as opposed to clutter.
*/
const archivedTrelloProducts = await parseProducts(archivedCards, "archived")
console.log(`Found ${archivedTrelloProducts.length} archived products.`)

/*
  All valid products added to 'completions' database
*/ 
await upsertArchivedProducts(archivedTrelloProducts)
console.log("Archived products added to database.")