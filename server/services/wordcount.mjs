const total = wordCountEntries
  .filter(e => e.productId === id && e.date >= startDate && e.date <= endDate)
  .reduce((sum, e) => sum + e.wordCount, 0)



//example json object for wordcount
const exampleObject = {
  "title": "RV202503_ES",
  "productCode": "RV",
  "wordCount": 450,
  "date": "2026-02-01"
}