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
        return response.text()

    } catch (error) {
        console.log(error.message)
    }
    
}

export function getCustomFields(cards) {
    let published = false;
    let crowdinProjectId = null;
    let crowdinFileId = null;
    let customFieldData = []

    for (let card in cards) {
        for (item in card['customFieldItems']) {
            
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
        customFieldData.push({'published': published, 'crowdinProectjId': crowdinProjectId, 'crowdinFileId': crowdinFileId}) 
    }

    return customFieldData
    
    
}


export function filterCards(cards) {
    const pattern = '^([A-Z-]*)([0-9]*[A-Z]*)(?=_)'
}




// TESTING
const cards = await getAllCards()
const fields = getCustomFields(cards)
console.log(fields)