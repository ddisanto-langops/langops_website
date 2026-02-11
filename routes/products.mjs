/*
This page is just an example of multi-page architecture using a router.
In server.js is this statement: app.use(require('./routes/products'));
It points to this file, which in turn catches request to the /products and sends the products.html file
*/
import express from 'express';
import path from 'path';

const router = express.Router();

router.get('/products/table', (req, res) => {
    res.sendFile(path.join(import.meta.dirname, '..', 'views', 'products_table.html'))
});

export default router;