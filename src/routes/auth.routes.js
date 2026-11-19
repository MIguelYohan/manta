import express from 'express';
import {
    register,
    login,
    googleLogin,
    googleCallback,
    getMe,
    logout
} from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * Rotas de Autenticação Híbrida (E-mail/Senha + Google OAuth)
 * Prefixo configurado no app: /auth
 */

// Cadastro convencional com e-mail e senha
router.post('/register', register);

// Login convencional com e-mail e senha
router.post('/login', login);

// Inicia o fluxo de login redirecionando para o Google
router.get('/google', googleLogin);

// Callback oficial para onde o Google devolve o usuário com o código de autorização
router.get('/google/callback', googleCallback);

// Retorna os dados do usuário logado (requer autenticação por Cookie ou Bearer Token)
router.get('/me', authMiddleware, getMe);

// Realiza o logout limpando o cookie de sessão
router.post('/logout', logout);

export default router;
