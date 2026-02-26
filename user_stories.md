# Requirements

## Business Logic
- [ ] Allow access only to users identified via Cloudflare  
- [ X ] Needs at least one main data table
    - [ ] Searching target languages needs to use friendly names
    - [ ] Must provide the same data as the LangOps Dashboard API service  
    - [ ] Data must be 2025 and onward  
    - [ X ] Must be able to filter data by language  
    - [ X ] Table must show a condensed view and be expandable on click  
- [ ] There must be a page for total words translated per language  
    - [ ] This page must be filterable by product type

## Dev
- [ ] Rewrite the backend API to use Javascript async capabilities
    - [ ] API must conform to the following schema: { id: 1, title: "RV202503_ES", productCode: "RV", targetLang: "Spanish", productStatus: "Completed", crowdinUrl: "https://crowdin.com/somefile", due: "1/21/2026", lastActivity: "12/5/2025", published: false, translationProg: 20, approvalProg: 15 }