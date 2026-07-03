import type { RawTrelloCard } from "../../../shared/types.js";


export class TrelloAdapter {

    constructor(
        private readonly trelloBoardId: string,
        private readonly trelloKey: string,
        private readonly trelloToken: string
    ) {
        if (!trelloBoardId || !trelloKey || !trelloToken ) {
            throw new Error("Unable to init Trello Adapter class: One or more missing API credentials")
        }
        
    }

    public activeCards: RawTrelloCard[] | null = null
    public archivedCards: RawTrelloCard[] | null = null
    public fetchedCard: RawTrelloCard | null = null
    public activeIds: {id: string}[] | null = null


    

    async getActiveCards(since?: string) {
        /**
         * Fetches all cards on the board (specified by Trello Board ID)
         * where the card is not archived (i.e. dateClosed property is null).
         * @param since Optional parmaeter to fetch cards starting at a certain date. 
         * If no date is specified, cards from only the last 24 hours are fetched.
        */
        
        const date = new Date();
        date.setDate(date.getDate() -1)
        const yesterday = date.toISOString().split('T')[0]
    
        try {
            const response = await fetch(
                `https://api.trello.com/1/boards/${this.trelloBoardId}/cards?key=${this.trelloKey}&token=${this.trelloToken}&fields=all&attachments=true&attachment_fields=all&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
                { method: 'GET' }
            )
            if (!response.ok) {
                throw new Error(`Trello API error: ${response.statusText}`)
            }
            const cards: RawTrelloCard[] = await response.json() as RawTrelloCard[]
            this.activeCards = cards
            
        } catch (error) {
            error instanceof Error ? console.log(`Get Active Cards: ${error.message}`) : 
                console.log("Get Active Cards: Unkown error")
            return []
        }
    }

    async getArchivedCards(since?: string) {
        
        const date = new Date();
        date.setDate(date.getDate() -1)
        const yesterday = date.toISOString().split('T')[0]
    
        try {
            const response = await fetch(
                `https://api.trello.com/1/boards/${this.trelloBoardId}/cards?key=${this.trelloKey}&token=${this.trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&actions=all&since=${since ?? yesterday}`,
                { method: 'GET' }
            )
            if (!response.ok) {
                throw new Error(`Trello API error: ${response.statusText}`)
            }
            const cards: RawTrelloCard[] = await response.json() as RawTrelloCard[]
            this.archivedCards = cards
        } catch (error) {
            error instanceof Error ? console.log(`Get Arhived Cards: ${error.message}`) :
                console.log("Get Archived Cards: Unknown  error")
            return []
        }
    }

    // Used for refreshing card data on demand in the UI
    async getCard(id: string) {
        const response = await fetch(
            `https://api.trello.com/1/cards/${id}?key=${this.trelloKey}&token=${this.trelloToken}&fields=name,dateLastActivity,due,url,dateClosed&actions=all&attachments=true&attachment_fields=all&customFieldItems=true`, {
                headers: {
                    accept: 'application-json'
                },
                method: 'GET'
            }
        )
        const card: RawTrelloCard = await response.json() as RawTrelloCard
        this.fetchedCard = card
    }


    async getActiveIds() {
        const response = await fetch(`https://api.trello.com/1/boards/${this.trelloBoardId}/cards?filter=visible&fields=id&key=${this.trelloKey}&token=${this.trelloToken}`,{
            headers: {
                accept: 'application-json'
            },
            method: 'GET'
        })
        const activeIds = await response.json() as {id: string}[]
        this.activeIds = activeIds
    }
    
}