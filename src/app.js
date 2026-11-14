import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import publicRoutes from './routes/public.routes.js';
import applicationRoutes from './routes/application.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Habilita CORS com suporte a Cookies HttpOnly e credenciais do Frontend
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Rotas da Aplicação
app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/applications', applicationRoutes);

export default app;
