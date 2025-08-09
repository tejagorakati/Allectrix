import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ensure uploads dir
try {
  fs.mkdirSync(path.join(process.cwd(), 'uploads'), { recursive: true });
} catch {}

// Health check
app.get('/health', (_req, res) => {
  res.json({ ok: true, uptimeSec: Math.round(process.uptime()) });
});

// Routes
app.use('/api', apiRouter);

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});