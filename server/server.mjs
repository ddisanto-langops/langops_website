import express from 'express';
import cors from 'cors'
import routes from './routes/index.mjs'


const app = express();
const PORT = process.env.PORT || 3200;

// allow cors
app.use(cors())

app.use('/', routes);

/*
PRODUCTION ONLY
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})
*/

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));