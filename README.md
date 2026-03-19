# LangOps Dashboard Website
*pcglangops.com*

## Pages  
- Dashboard: total words, filterable by product code, group and language
- Products: all Trello products whose titles match a pre-defined regex pattern and which are not archived
- Completions: all Trello products which 1. have 'PUBLISHED' checked off, or 2. are archived on Trello

## Data Structure  
There are two tables within the PostgreSQL database: one for transient data ("product"), the other for permanent data ("completions"). The latter does not include translation/approval progress, due dates and other such information, since they're no longer relevant after completion.  
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