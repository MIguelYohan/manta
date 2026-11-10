import { verifyToken } from '../services/jwt.service.js';

/**
 * Middleware de Autenticação JWT.
 * 
 * Intercepta requisições HTTP, valida o cabeçalho Authorization no padrão Bearer Token,
 * verifica a autenticidade do token JWT e injeta os dados do usuário em `req.user`.
 * 
 * Se o token for ausente, expirado ou inválido, interrompe o fluxo com status 401.
 */
export default function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            status: 'error',
            message: 'Acesso negado: token de autenticação não fornecido.'
        });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            status: 'error',
            message: 'Formato de token inválido. Esperado: Bearer <token>.'
        });
    }

    const token = parts[1];

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
