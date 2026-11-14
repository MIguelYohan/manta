import express from 'express';
import {
    googleLogin,
    googleCallback,
    getMe,
    logout
} from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Rotas de Autenticação (Google OAuth + Sessão JWT)
 * Prefixo configurado no app: /auth
 */

// Inicia o fluxo de login redirecionando para o Google
router.get('/google', googleLogin);

// Callback oficial para onde o Google devolve o usuário com o código de autorização
router.get('/google/callback', googleCallback);

// Retorna os dados do usuário logado (requer autenticação por Cookie ou Bearer Token)
router.get('/me', authMiddleware, getMe);

// Realiza o logout limpando o cookie de sessão
router.post('/logout', logout);

export default router;
