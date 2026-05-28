import express, { type ErrorRequestHandler } from 'express';
import router from './routes/index.js'
import helmet from 'helmet'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { syncProducts } from './services/sync.js';

// sync every time the server restarts
syncProducts()

const app = express();
const PORT = process.env.PORT || 3200;
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'Dev'
    ? 'http://localhost:5173'
    : 'https://pcglangops.com',
  methods: ['GET', 'PUT', 'DELETE', 'POST']
}))
app.use(express.json())
app.use(router)

const clientDist =
  __dirname.endsWith(path.join('dist', 'server'))
    ? path.join(__dirname, '../../../client/dist')
    : path.join(__dirname, '../client/dist')

app.use(express.static(clientDist))

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ message });
};

app.use(errorHandler)

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
