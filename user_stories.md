# Requirements

**Business Logic**
- [ ] Allow access only to users identified via Cloudflare  
- [x] Needs at least one main data table
    - [x] Searching target languages needs to use friendly names
    - [ ] Must provide the same data as the LangOps Dashboard API service  
    - [ ] Data must be 2025 and onward  
    - [x] Must be able to filter data by language  
    - [x] Table must show a condensed view and be expandable on click 
    - [x] Table must implement an on-click filter for each tab in the spreadsheet
- [ ] There must be a dashbaord-style page for total words translated per language  
    - [ ] This page must also be filterable by product type

**Dev**
- [x] The backend API must use Node.js to take advantage of async capabilities

**JSON Schema (transient data)**
- [ ] JSON returned from API must conform to the following schema, types and enums:
    - [x] title: string
    - [x] productCode: string
    - [x] targetLang: string
        - [x] this must be a "friendly name" e.g. "Spanish" not "es"
    - [x] productStatus: string = completed || pending || unknown
    - [x] crowdinUrl: string || null
    - [x] TrelloUrl: string
    - [x] due: string (date format) || null
    - [x] lastActivity: string (date format) || null
    - [x] published: boolean
    - [x] translationProg: integer || null
    - [x] approvalProg: integer || null
    - [ ] mediaInfo: dict
        - [x] mediaType: array[string] = audio_video || literature || website || interpretation || pcog.church
        - [x] wordCount: int || null

**JSON Schema (permanent data)**  
- [ ] The JSON used to store product information long-term must conform to the following schema, types and enums:
    - [ ] title: string
    - [ ] productCode: string
    - [ ] targetLang: string
    - [ ] mediaInfo: dict
        - [ ] mediaType: array[string] = audio_video || literature || website || interpretation || pcog.church
        - [ ] wordCount: int || null
    - [ ] datePublished
    - [ ] dateArchived
    
## PostgreSQL Databases  
*Database name: langops_dashboard*   

**Transient Data**   
*Table name: products*  
*keys:*  
- title: TEXT PRIMARY KEY  
- productCode: TEXT  
- targetLang: TEXT  
- productStatus: TEXT  
- crowdinUrl: TEXT  
- TrelloUrl: TEXT  
- due: TIMESTAMP WITH TIME ZONE  
- lastActivity: TIMESTAMP WITH TIME ZONE  
- published: BOOLEAN  
- translationProg: INTEGER  
- approvalProg: INTEGER  
- mediaType: TEXT[]  
- wordCount: INTEGER

**Permanent Data**  
*Table name: completions*  
*keys:*
- id: SERIAL PRIMARY KEY  
- title: TEXT  
- productCode: TEXT  
- targetLang: TEXT  
- datePublished: TIMESTAMP WITH TIME ZONE  
- dateArchived: TIMESTAMP DEFAULT NOW() 
