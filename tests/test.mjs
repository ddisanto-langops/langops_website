import { getTrelloProducts } from "../server/services/products.mjs";

async function getArchivedCards() {
  const trelloBoardId = process.env.TrelloBoardId;
  const trelloKey = process.env.TrelloKey;
  const trelloToken = process.env.TrelloToken;
  

    try {
        const response = await fetch(`https://api.trello.com/1/boards/${trelloBoardId}/cards?key=${trelloKey}&token=${trelloToken}&filter=closed&fields=name,idLabels,labels,due,dateLastActivity,url,isTemplate&attachments=true&attachment_fields=name,url&customFieldItems=true&since=2025-01-01`, {
            method: 'GET'
        });

        const data = await response.json()
        return data

    } catch (error) {
        console.log(`getArchivedCards: ${error.message}`)
    };
};

const cards  = await getArchivedCards()
const trelloProducts = getTrelloProducts(cards)
console.log(trelloProducts)


