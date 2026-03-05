import fetch from 'node-fetch'
import { customFields, languageCodes } from './constants.mjs';
import { exampleCard } from './exampleData.mjs';

export async function getAllCards() { 
    const boardId = process.env.TrelloBoardId;
    const key = process.env.TrelloKey;
    const token = process.env.TrelloToken;

    try {
        const response = await fetch(`https://api.trello.com/1/boards/${boardId}/cards?key=${key}&token=${token}`, {
            method: 'GET',
        })
        return response.json()

    } catch (error) {
        console.log(`getAllCards: ${error.message}`)
    }
    
}

export function extractProducts(cards) {

    const productCodePattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)'
    const targetLangPattern = '(?<=_)([AENSFINLRDTOPH]{2})(?:[-])([AENSFINLRDTOPH]{2})(?![A-Za-z-])'
    let productData = []

    try {

        for (let card of cards) {
            const title = card.name;
            const productCode = title.match(productCodePattern)?.[1];
            const targetLang = languageCodes[title.match(targetLangPattern)?.[2]];
            // TODO: Finish writing product data extraction

            //TODO: add custom fields to product object
            
            /*
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
            */
            productData.push({
                // TODO: finish building this JSON structure to match desired schema
                "title": title,
                "productCode": productCode,
                "targetLang": targetLang
                
            }) 
        
    }
    

    return productData

    } catch (error) {
        console.log(`extractProducts: ${error.message}`)
    }

    
    
    
}


// TESTING
//const cards = await getAllCards()

const result = extractProducts([exampleCard]);
console.log(result)

