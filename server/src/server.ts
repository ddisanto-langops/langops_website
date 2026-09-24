import express, { type ErrorRequestHandler, type Request, type Response, type NextFunction } from 'express';
import router from './routes/index.js'
import helmet from "helmet"
import cors from 'cors'
import jwt from "jsonwebtoken"
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3200;
const nodeEnv = (process.env.NODE_ENV ?? '').toLowerCase()
const isDev = nodeEnv === 'dev' || nodeEnv === 'development'

app.use(cookieParser())

const metadata = (req: Request, res: Response, next: NextFunction) => {
  const time = new Date().toISOString()
  const path = req.path
  const email = () => {
    const cookieToken = req.cookies ? req.cookies["CF_Authorization"] : ""
    const decoded = jwt.decode(cookieToken) as jwt.JwtPayload | null
    if (decoded && decoded.email) {
      const email = decoded.email
      return email
    } else {
      return "unavailable"
    }
  }
  console.log(`Path: ${path} | User: ${email()} | Time: ${time}`)
  next()
}


app.use(helmet())
app.use(cors({
  origin: isDev
    ? 'http://localhost:5173'
    : 'https://pcglangops.com',
  methods: ['GET', 'PATCH', 'DELETE', 'POST']
}))
app.use(express.json({ limit: '50mb'}))
app.use(metadata)
app.use(router)

const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(err.statusCode || 500).json({ message });
};

app.use(errorHandler)

app.listen(PORT, () => console.log(`server running on port ${PORT}`));