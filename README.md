# LangOps Website

## Key Concepts
### Pages  
- Dashboard: total words, including published active products and all archived products. filterable by product code, media group, language, and date.
- Products: all Trello cards where the title provides a valid product code, a valid target language, and where the "Exclude" custom field is not checked.
- Completions: all Trello products which have 'PUBLISHED' checked off and are archived on Trello
- Global search: coming soon

### Media Groups
All products are classified as belonging to one of the media group subsets, e.g. website or audio/video. These can be filtered in the Dashboard, as well as in Products and Completions.

### Editing Records
If information about any completed product is incorrect, or the product record needs to be deleted, this can be done by clicking on it in Completions. A modal window will open, allowing edits and deletion. NOTE: archived products are fetched from within the last day. If the product re-appears, this is becuase it was archived within that time. It is necessary to wait.

### Data Structure  
There are two tables within the PostgreSQL "langops" database: one for transient data ("product"), the other for permanent data ("completions"). The latter does not include translation/approval progress, due dates and other such information, since they're no longer relevant after completion.  

**The transient data (products) data table captures:**  
- Title
- Product Code
- Target Language
- Product Status (Completed, pending, unknown)
- Trello URL
- Crowdin URL
- Due
- Last Activity
- Published (true/false)
- Translation progress (if Crowdin project and file ID provided on Trello card)
- Approval progress (if Crowdin project and file ID provided on Trello card)
- Media info: product grouping (magazine, audio/video, website) and wordcount
  
**The permanent (completions) data table captures:**
- Title
- Product Code
- Target Language
- Media group (magazine, audio/video, website) 
- Word count
- Date published
- Date archived

## Constants  
The website relies on constant variables to define controlled inputs, e.g. dropdowns. Editing the constants.js file, e.g. to add a product code, will propagate the change throughout the website. Examples of constants include target languages, product codes, and abstractions for the UI to display user-friendly names instead of programmatically-formated ones.