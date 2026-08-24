# LangOps Website
## Intro
### Goal
The LangOps website aims to make localization management as visible and simple as possible. Products should be easy to inspect, follow and search. In addition, the website makes possible automations which involve custom logic and are not possible elsewhere.  
  
**This website is aimed at:**  
1) Language managers, who need to keep up with specific products as well as general trends in their language(s);  
2) Admin assistants, who need to find localized products and titles rapidly along with links and other relevant metadata;
3) Solution architects, who plan integrations and manage business logic;
4) Directors and higher-level translation department supervisors who need to understand long-term trends

The website is built with future expansion in mind, e.g. Crowdin and Blackbird integrations, and leverages an API (see below).

## Tech Stack
From top (client) to bottom (infrastructure), the website uses the following technologies:  
  
**The Website:**
- Typescript React/HTML/CSS: client-facing application
- Tanstack Table and Tanstack Query: data visualization for the products table
- Express.js (Typescript): server for backend of the website application
- Docker: packages the entire website, providing predictable environment and behavior on any server

**The LangOps Ecosystem**
- LangOps Gateway: Receives webhooks from any configured provider, performs security checks, then decides what LangOps API calls to make. [See the repo](https://github.com/ddisanto-langops/langops-gateway)
- LangOps API: Controls all interactions with the LangOps database (get/edit/delete products, etc.). [See the repo](https://github.com/ddisanto-langops/langops-api)
- LangOps Database: PostgreSQL database which stores all product data, as well as data on automation failures. Uses on-premises mirroring to safeguard data.

**Web Hosting**
- Cloudflare: All access and web hosting is provided by Cloudflare Zero-Trust
- LangOps Server: A Proxmox VE cluster, currently consisting of 2 nodes. 


## Navigating the Site  
These are the pages you'll encounter:
- Dashboard: total words of published and archived products. Filterable by language, product code, media group, and date.
- Products: all Trello cards which match the selection critereia (see below). Filterable by language, product code, media group, date and title/localized title.
- Label IDMLs: Extract "stories" from any IDML file uploaded to Crowdin, and name them for assignment to translators. (In the organization's current workflows, each story file corresponds to an article which can be translated).
- Failures: See products which failed automated tracking, and manually edit or add them to the database.
- API Documentation: Consult the FastAPI documentation for the LangOps API.

## Environment Variables
The website requires you to provide credentials for external services it accesses. The necessary services are:
- LangOps API `CF-Access-Client-Id` and `CF-Access-Secret` (for translation products)
- Crowdin (for labeling of IDMLs)