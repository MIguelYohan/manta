import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    throw new Error('A variável de ambiente JWT_SECRET não foi configurada no .env.');
}

/**
 * Gera um token JWT assinado para um usuário.
 * 
 * @param {object|string} payload - Dados a serem incluídos no token (ex: { userId: '...' } ou o próprio userId).
 * @param {string} [expiresIn] - Tempo de expiração customizado (padrão: 7d).
 * @returns {string} Token JWT assinado.
 */
export function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
    const data = typeof payload === 'string' ? { userId: payload } : payload;

    return jwt.sign(data, JWT_SECRET, {
        expiresIn
    });
}

/**
 * Valida a autenticidade e a validade de um token JWT.
 * 
 * @param {string} token - Token JWT recebido no cabeçalho Authorization.
 * @returns {object} Payload decodificado do token.
 * @throws {Error} Caso o token seja inválido ou esteja expirado.
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            const err = new Error('O token JWT expirou.');
            err.code = 'TOKEN_EXPIRED';
            throw err;
        }

        const err = new Error('Token JWT inválido.');
        err.code = 'INVALID_TOKEN';
        throw err;
    }
}

export default {
    generateToken,
    verifyToken
};
