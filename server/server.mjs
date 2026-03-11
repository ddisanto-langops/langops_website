import express from 'express';
import router from './routes/index.mjs'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'


const app = express();
const PORT = process.env.PORT || 3200;
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// allow cors
app.use(cors())

app.use(router)

app.use(express.static(path.join(__dirname,'../client/dist')))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'))
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

app.listen(PORT, () => console.log(`server running on port ${PORT}`));