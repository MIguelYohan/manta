import express from 'express';
import publicRoutes from './routes/public.routes.js';
import applicationRoutes from './routes/application.routes.js';

const app = express();

app.use(express.json());
app.use('/', publicRoutes);
app.use('/applications', applicationRoutes);

export default app;
