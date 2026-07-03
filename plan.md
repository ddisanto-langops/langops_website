# Refactor of LangOps Website Backend

## Webhooks
As much as possible, this should shift to a webhook-based architecture. Trello posts a webhook to the LangOps website server, the API or a router service. All we need to get is the ID and the action type, and then call the appropriate Adapter method to get the desired data. E.g. a product was updated => call getCard() using its ID. Then that data gets fed to the API, frontend queries refresh, and data is updated.

## Adapter Layer
An adapter represents any external data source from which a LangOps product receives data. There can be as many adapters as needed for whatever outside services are desired.  
The adapter class may contain methods that fetch data from an external service

## Product Factory Layer
**Goal:** Move the raw data into the required data schema of the adapter (defined in `./shared/types.ts`)
For example, take raw Trello data and transform it into JSON compliant with `TrelloDataSchema`.

### Files/Folders
- `./server/services/trelloFunctions.ts`  
- `./server/services/youTubeFunctions.ts`  
- `./server/services/crowdinFunctions.ts`
- `./server/services/productFactory.ts`

## Product Layer
A class representing a LangOps product anywhere in the pipeline (from creation to archive and anywhere in between).  
**Goal:** Take the data schema produced by the adapter layer and integrate into `LangOpsProduct` class.  
**The `LangOpsProduct` data shape must conform to the requirements specified by the LangOps API.**

### Files/Folders
`./server/classes.ts`