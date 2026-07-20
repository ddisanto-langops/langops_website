import * as cheerio from 'cheerio'

async function getlocalizedTitle(url: string): Promise<string> {
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

// Example Execution
const targetUrl = 'https://www.latrompeta.es/articles/posts/la-alianza-nuclear-de-francia-con-alemania';
const localizedTitle = await getlocalizedTitle(targetUrl)
console.log(localizedTitle)