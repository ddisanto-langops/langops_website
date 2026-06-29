import type { LangOpsProduct, RawTrelloCard } from "../../shared/types.js"
import { productCodes, supportedLanguages } from "../../shared/constants.js"
import { ActiveCard, ArchivedCard } from "../classes.js";
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const trelloBoardId = process.env.TrelloBoardId;
const trelloKey = process.env.TrelloKey;
const trelloToken = process.env.TrelloToken;



/*
* Trello
*/

export async function getActiveCards(since?: string): Promise<RawTrelloCard[]> {
    if (!trelloBoardId || !trelloKey || !trelloToken) throw new Error("Get active cards: missing credentials")
    
    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0]

    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
            { method: 'GET' }
        )
        if (!response.ok) {
            throw new Error(`Trello API error: ${response.statusText}`)
        }
        const cards: RawTrelloCard[] = await response.json() as RawTrelloCard[]
        return cards
    } catch (error) {
        error instanceof Error ? console.log(`Get Active Cards: ${error.message}`) : 
            console.log("Get Active Cards: Unkown error")
        return []
    }
}

export async function getArchivedCards(since?: string): Promise<RawTrelloCard[]> {
    if (!trelloBoardId || !trelloKey || !trelloToken) throw new Error("Get archived cards: missing credentials!")
    
    const date = new Date();
    date.setDate(date.getDate() -1)
    const yesterday = date.toISOString().split('T')[0]

    try {
        const response = await fetch(
            `https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
            { method: 'GET' }
        )
        if (!response.ok) {
            throw new Error(`Trello API error: ${response.statusText}`)
        }
        const cards: RawTrelloCard[] = await response.json() as RawTrelloCard[]
        return cards
    } catch (error) {
        error instanceof Error ? console.log(`Get Arhived Cards: ${error.message}`) :
            console.log("Get Archived Cards: Unknown  error")
        return []
    }
}

// Used for refreshing card data on demand in the UI
export async function getCard(id: string): Promise<RawTrelloCard> {
    const response = await fetch(
        `https://api.trello.com/1/cards/${id}?key=${trelloKey}&token=${trelloToken}&fields=name,dateLastActivity,due,url,dateClosed&actions=all&attachments=true&attachment_fields=all&customFieldItems=true`, {
            headers: {
                accept: 'application-json'
            },
            method: 'GET'
        }
    )
    const card: RawTrelloCard = await response.json() as RawTrelloCard
    return card
}


export async function getActiveIds(): Promise<{id: string}[]> {
    const response = await fetch(`https://api.trello.com/1/boards/${trelloBoardId}/cards?filter=visible&fields=id&key=${trelloKey}&token=${trelloToken}`,{
        headers: {
            accept: 'application-json'
        },
        method: 'GET'
    })
    const activeIds = await response.json() as {id: string}[]
    return activeIds
}


export async function getlocalizedTitle(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching article title. Status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const title = $('h1.text-left').contents().filter((_, node) => node.nodeType === 3).text().trim();    

    return title;

  } catch (error) {
    console.error('Scraping failed:', error);
    return 'NOT FOUND';
  }
}

/*
 * Product Factory
 * This function creates products from raw cards.
 * It also applies logical tests to filter out 
 * cards which do not meet business logic requirements.
 * A card will be skipped under the following conditions:
 *   1) no product code exists;
 *   2) product code isn't supported;
 *   3) the card is a template;
 *   4) the target language is not one of the supported languages;
 *   5) the "Exclude" checkbox is checked.
*/


export async function parseProducts(rawCards: RawTrelloCard[]): Promise<LangOpsProduct[]> {
    const products = []
    for (const item of rawCards) {

        // const card = new LangOpsProduct()
        
        const cardCustomFields = card.getCustomFields()
        if (!productCodes.includes(card.productCode)) {
            console.log(`Skipped: ${card.title} | Reason: Product code invalid or not yet supported`)
            continue
        } else if (card.isTemplate) {
            console.log(`Skipped: ${card.title} | Reason: Card is a template`)
            continue
        } else if (cardCustomFields.exclude) {
            console.log(`Skipped: ${card.title} | Reason: 'Exclude' box is checked`)
            continue
        } else if (!card.targetLanguage || !supportedLanguages.includes(card.targetLanguage) ) {
            console.log(`Skipped: ${card.title} | Reason: Target language missing or not yet supported (got '${card.targetLanguage}')`)
            continue
        } else if (!card.datePublished && mode === "archived") {
            console.log(`Skipped: ${card.title} | Reason: In mode "Archived" but missing date published`)
            continue
        } else {
            console.log(`Accepted: ${card.title}`)
        }
        
        if (card instanceof ActiveCard) {
            const product = await card.parseActiveCard()
            products.push(product)
        } else if (card instanceof ArchivedCard) {
            const product = await card.parseArchivedCard()
            products.push(product)
        }
    }
    return products
}