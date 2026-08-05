# Refactor of LangOps Website Backend

## Adapter Layer
An adapter represents a class which has methods capable of pulling data from an external source. There can be as many adapters as needed for whatever outside services are desired.  

## Product Factory Layer
A class with methods which transform the raw data (from the adapter) into the required data schema defined in `./shared/types.ts`.
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