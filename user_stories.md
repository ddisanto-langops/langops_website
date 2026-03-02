# Requirements

## Business Logic
- [ ] Allow access only to users identified via Cloudflare  
- [ X ] Needs at least one main data table
    - [ X ] Searching target languages needs to use friendly names
    - [ ] Must provide the same data as the LangOps Dashboard API service  
    - [ ] Data must be 2025 and onward  
    - [ X ] Must be able to filter data by language  
    - [ X ] Table must show a condensed view and be expandable on click  
- [ ] There must be a dashbaord-style page for total words translated per language  
    - [ ] This page must be filterable by product type
    

## Dev
- [ X ] The backend API must use Node.js to take advantage of async capabilities
- [ ] JSON returned from API must conform to the following schema, types and ennums:
    - [ ] title: string
    - [ ] productCode: string
    - [ ] targetLang: string
        - [ ] this must be a "friendly name" e.g. "Spanish" not "es"
    - [ ] productStatus: string = completed || in_progress || null
    - [ ] crowdinUrl: string || null
    - [ ] due: string (date format) || null
    - [ ] lastActivity: string (date format) || null
    - [ ] published: boolean
    - [ ] translationProg: integer || null
    - [ ] approvalProg: integer || null
    - [ ] mediaInfo: dict
        - [ ] mediaType: string = text || audio || video
        - [ ] wordCount: int || null
        - [ ] duration: int (time in minutes) || null