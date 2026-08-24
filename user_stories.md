# User Stories: LangOps Website

## Context
Client is currrently using a spreadsheet mith many tabs to keep track of translation data. There is a summary dashboard as well as tabs for each product category, e.g. books, magazines, videos. Client wants at least this level of filtering in the website. The spreadsheet is updated by a basic script at the moment and pulls localized titles and YouTube data in addition to Trello information. Trello is the source of truth.

## Requirements

**Business Logic**  
- [x] Allow access only to users identified via Cloudflare OTP  
- [x] Needs at least one main data table
    - [x] Searching target languages needs to use friendly names
    - [x] Must provide the same data as the LangOps Dashboard API service [deprecated as of July 2026] 
    - [x] Data must be 2025 and onward  
    - [x] Table must show a condensed view and be expandable on click 
    - [x] Table must implement a filter which allows at least as much filtering as each tab in the spreadsheet
- [x] There must be a dashbaord-style page for total words translated per language  
    - [x] This page must also be filterable by product type

**Dev**
- [x] The backend API must use Node.js to take advantage of async capabilities
