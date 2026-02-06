const path = require('path')
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3200;

app.use(`/`, express.static(path.join(__dirname, '/public')));

app.use('/', require('./routes/root'));

app.listen(PORT, () => console.log(`server running on port ${PORT}`));