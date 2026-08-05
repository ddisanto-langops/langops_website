import express, { type ErrorRequestHandler, type Request, type Response, type NextFunction } from 'express';
import router from './routes/index.js'
import helmet from "helmet"
import cors from 'cors'

const app = express();
const PORT = process.env.PORT || 3200;
const nodeEnv = (process.env.NODE_ENV ?? '').toLowerCase()
const isDev = nodeEnv === 'dev' || nodeEnv === 'development'

app.use(helmet())
app.use(cors({
  origin: isDev
    ? 'http://localhost:5173'
    : 'https://pcglangops.com',
  methods: ['GET', 'PATCH', 'DELETE', 'POST']
}))
app.use(express.json({ limit: '50mb'}))
app.use(router)

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(err.statusCode).json({ message });
};

app.use(errorHandler)

app.listen(PORT, () => console.log(`server running on port ${PORT}`));