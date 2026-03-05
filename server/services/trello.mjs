import fetch from 'node-fetch'
import { customFields } from './constants.mjs';

export async function getAllCards() { 
    const boardId = process.env.TrelloBoardId;
    const key = process.env.TrelloKey;
    const token = process.env.TrelloToken;

    try {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`, {
            method: 'GET',
        })
        return JSON.stringify(response)

    } catch (error) {
        console.log(`getAllCards: ${error.message}`)
    }
    
}

export function extractProducts(cards) {
    let published = false;
    let crowdinProjectId = null;
    let crowdinFileId = null;
    let productData = []

    try {
        for (let card of cards) {
            for (item of card['customFieldItems']) {
            
                // Check if has "published" field and if it's checked off
                if (item === customFields.published && item['value']['checked'] === 'true') {
                    published = true
                }

                // Check if has Crowdin project ID
                if (item['idCustomField'] === customFields.crowdinProj && item['value']['text']) {
                    crowdinProjectId = item['value']['text']
                }

                // Check if has Crowdin file ID
                if (item['idCustomField'] === customFields.crowdinFile && item['value']['text']) {
                    crowdinFileId = item['value']['text']
                }
            }
        
            productData.push({
                // TODO: finish building this JSON structure to match desired schema
                'published': published,
                'crowdinProectjId': crowdinProjectId,
                'crowdinFileId': crowdinFileId
            }) 
    }

    return productData

    } catch (error) {
        console.log(`getCustomFields: ${error.message}`)
    }

    
    
    
}


export function filterCards(cards) {
    const pattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)'
}




// TESTING
const cards = await getAllCards()

console.log(cards[400])