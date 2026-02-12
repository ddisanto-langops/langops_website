import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.mjs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3200;

app.set('view engine', 'pug');
app.set('views', './views');

// static files
app.use(express.static(path.join(__dirname, 'public')));

// views
app.use('/', routes);

// catch everything else via 404
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