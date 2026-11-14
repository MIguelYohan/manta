import { verifyToken } from '../services/jwt.service.js';

/**
 * Middleware de Autenticação Híbrido (Cookies HttpOnly + Bearer Token).
 * 
 * Intercepta requisições HTTP, obtém o token JWT a partir do Cookie HttpOnly (navegador)
 * ou do cabeçalho Authorization (Bearer Token), valida sua autenticidade e injeta
 * os dados do usuário em `req.user`.
 * 
 * Se o token for ausente, expirado ou inválido, interrompe o fluxo com status 401.
 */
export default function authMiddleware(req, res, next) {
    let token = null;

    // 1. Tenta extrair o token do Cookie HttpOnly
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 2. Fallback: Se não estiver no cookie, tenta extrair do cabeçalho Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    // Se nenhum token foi encontrado
    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Acesso negado: token de autenticação não fornecido.'
        });
    }

    try {
        const decoded = verifyToken(token);

        // Injeta os dados do usuário autenticado no objeto da requisição
        req.user = {
            id: decoded.userId,
            ...decoded
        };

        return next();
    } catch (error) {
        return res.status(401).json({
            status: 'error',
            message: error.message || 'Token de autenticação inválido.'
        });
    }
}
