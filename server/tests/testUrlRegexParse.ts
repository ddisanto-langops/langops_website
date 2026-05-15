import { getArchivedCards, parseProducts } from "../services/syncFunctions.js"

const cards = await getArchivedCards()


try {
    const archivedProducts = await parseProducts(cards, "archived")
    console.log(archivedProducts)
} catch (error) {
    error instanceof Error ? console.log(`testClasses error: ${error.message}`)
        : console.log("Unknown error")
}


/*
const links = [
  "http://www.latrompette.fr/articles/posts/etats-unis-le-plan-de-redecoupage-electoral-des-democrates-bloque-par-la-cour-supreme-de-virginie",
  "http://www.latrompette.fr/editor/articles/posts/etats-unis-le-plan-de-redecoupage-electoral-des-democrates-bloque-par-la-cour-supreme-de-virginie/edit",
  "https://crowdin.com/editor/NewsFR/12921/en-fr",
  "http://www.latrompette.fr/editor/articles/posts/etats-unis-le-plan-de-redecoupage-electoral-des-democrates-bloque-par-la-cour-supreme-de-virginie/edit",
  "http://www.latrompette.fr/articles/posts/etats-unis-le-plan-de-redecoupage-electoral-des-democrates-bloque-par-la-cour-supreme-de-virginie"
]

const editorPattern = /\/editor\/articles\/posts/
const postPattern = /(?<!editor)\/articles\/posts/
const crowdinPattern = /crowdin/

for (const link of links) {
  const editorMatch = link.match(editorPattern)
  const postMatch = link.match(postPattern)
  const crowdinMatch = link.match(crowdinPattern)
  editorMatch ? console.log(`This is an editor link: ${link}`) : null
  postMatch ? console.log(`This is a post: ${link}`) : null
  crowdinMatch ? console.log(`This is a Crowdin link: ${link}`) : null

}
*/