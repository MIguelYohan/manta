import express from 'express';
import publicRoutes from './routes/public.routes.js';

const API_PORT = 3030;
const app = express();
app.use('/', publicRoutes);

app.listen(API_PORT, () => {
    console.log(`App listen on port ${API_PORT}`);
});