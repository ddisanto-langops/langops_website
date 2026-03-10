import express from 'express';
import cors from 'cors'
import routes from './routes/index.mjs'
import path from 'path'
import { fileURLToPath } from 'url'


const app = express();
const PORT = process.env.PORT || 3200;
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// allow cors
app.use(cors())

app.use(express.static(path.join(__dirname,'../client/dist')))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));