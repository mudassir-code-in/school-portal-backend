import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { authRouter } from './routes/auth.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { resultRouter } from './routes/result.routes.js';
import { studentRouter } from './routes/student.routes.js';
import { healthRouter } from './routes/health.routes.js';


export const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/result', resultRouter);
app.use('/api/student', studentRouter);
app.use('/api/health', healthRouter);
