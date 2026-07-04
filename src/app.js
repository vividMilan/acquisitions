import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import securityMiddleware from '#middlewares/security.middleware.js'

// Route imports
import authRoutes from '#routes/auth.routes.js';

const app = express();
app.use(helmet());
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
// app.use(securityMiddleware)

app.get('/', (req, res) => {
  logger.info('Hello from Acquisitions API');
  res.status(200).send('Hello World!');
});

app.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  res.status(200).send({status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime()});
})

app.get('/api', (req, res) => {
  res.status(200).send({ message: 'Acquisition API is running' });
})

app.use("/api/auth", authRoutes) 

export default app;
