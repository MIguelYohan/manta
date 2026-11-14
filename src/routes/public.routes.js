import express from 'express';
import prisma from '../config/prisma.js';
import { getAll, getById, create, update, remove } from '../controllers/application.controller.js';

const router = express.Router();

/*
    Rota para testar conexão básica com a API
*/
router.get('/health', (req, res) => {
    res.send({ status: 'API Running OK!' });
});

export default router;
