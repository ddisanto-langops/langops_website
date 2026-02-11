import express from 'express';
import path from 'path';

import products from './routes/products.mjs'
import root from './routes/root.mjs'

const app = express();
const PORT = process.env.PORT || 3200;

/* example of multi-page architecture
(one 'use' statement for the products route, which handles multiple subpages)
*/
app.use(products);
app.use(root);

app.use((req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(import.meta.dirname,'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({message: '404 not found'});
    } else {
        res.type('txt').send('404 not found');
    }
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));