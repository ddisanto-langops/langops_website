class WebAdapter {
    async getlocalizedTitle(url: string): Promise<string> {
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
                console.error('Failed to scrape localized title:', error);
                return 'NOT FOUND';
            }
        }
}