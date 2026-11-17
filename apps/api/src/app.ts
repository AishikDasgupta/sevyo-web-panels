import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { apiRouter } from './routes';
import { errorHandler } from './middleware/error-handler';
import { env } from './config/env';
import { uploadsStaticPath } from './middleware/upload';

export const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (curl, server-to-server)
      if (!origin || env.corsOrigin.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, slow down', code: 'RATE_LIMITED' } },
});
app.use('/api', globalLimiter);

// Phase 7: serve uploaded files (avatars, logos)
app.use('/uploads', express.static(uploadsStaticPath, { maxAge: '7d', immutable: false }));

app.use('/api', apiRouter);

// 404 for unknown API routes
app.use('/api', (_req, res) => {
  res.status(404).json({ error: { message: 'API route not found', code: 'NOT_FOUND' } });
});

app.use(errorHandler);