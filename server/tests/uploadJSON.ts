import { upsertArchivedProducts } from "../services/functions.js";
import { readFileSync } from "node:fs";
/*
const websiteCompletions = readFileSync("C:/Users/dadisanto/Downloads/drive-download-20260603T170730Z-3-001/websiteCompletions.json", 'utf-8')
const webJson =  JSON.parse(websiteCompletions)
await upsertArchivedProducts(webJson)

const magazines = readFileSync("C:/Users/dadisanto/Downloads/drive-download-20260603T170730Z-3-001/magazines.json", 'utf-8')
const magazineJson = JSON.parse(magazines)
await upsertArchivedProducts(magazineJson)

const lit = readFileSync("C:/Users/dadisanto/Downloads/drive-download-20260603T170730Z-3-001/literature.json", 'utf-8')
const litJson = JSON.parse(lit)
await upsertArchivedProducts(litJson)

const interpretation = readFileSync("C:/Users/dadisanto/Downloads/drive-download-20260603T170730Z-3-001/interpretations.json", 'utf-8')
const interpretationJson = JSON.parse(interpretation)
await upsertArchivedProducts(interpretationJson)

const audioVideo = readFileSync("C:/Users/dadisanto/Downloads/drive-download-20260603T170730Z-3-001/audioVideoProducts.json", 'utf-8')
const avJson = JSON.parse(audioVideo)
await upsertArchivedProducts(avJson)
*/
const other = readFileSync("C:/Users/dadisanto/Downloads/drive-download-20260603T170730Z-3-001/other.json", 'utf-8')
const otherJson = JSON.parse(other)
await upsertArchivedProducts(otherJson)
