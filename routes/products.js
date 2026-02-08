/*
This page is just an example of multi-page architecture using a router.
In server.js is this statement: app.use(require('./routes/products'));
It points to this file, which in turn catches request to the /products and sends the products.html file
*/
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/products/table', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'products_table.html'));
});

module.exports = router;