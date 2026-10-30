import express from 'express';
import prisma from '../config/prisma.js';

const router = express.Router();

/*
    Rota para testar conexão básica com a API
*/
router.get('/health', (req, res) => {
    res.send({ status: 'API Running OK!' });
});

router.post('/login', async (req, res) => {
    // Rota de teste/preparação para Google OAuth
    res.status(501).json({ message: 'A autenticação será implementada via Google OAuth.' });
});

export default router;
