import UserModel from '../models/user.js';
import { getGoogleAuthUrl, getUserInfoFromCode } from '../services/googleAuth.service.js';
import { generateToken } from '../services/jwt.service.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Inicia o fluxo de autenticação redirecionando o navegador para o Google.
 */
export function googleLogin(req, res) {
    try {
        const authUrl = getGoogleAuthUrl();
        return res.redirect(authUrl);
    } catch (error) {
        console.error('Erro ao gerar URL de autorização do Google:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao iniciar autenticação com o Google.'
        });
    }
}

/**
 * Rota de callback que recebe a resposta do Google após o consentimento do usuário.
 */
export async function googleCallback(req, res) {
    const { code, error } = req.query;

    if (error || !code) {
        console.warn('Autorização do Google cancelada ou com erro:', error);
        return res.redirect(`${FRONTEND_URL}/login?error=${encodeURIComponent(error || 'access_denied')}`);
    }

    try {
        // 1. Troca o código pelos dados do usuário autenticado no Google
        const userInfo = await getUserInfoFromCode(code);

        // 2. Cria ou atualiza o usuário no MongoDB
        const user = await UserModel.upsertByGoogle(userInfo);

        // 3. Emite o JWT próprio do Manta para o usuário
        const token = generateToken(user.id);

        // 4. Configura o Cookie HttpOnly de segurança
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
        });

        // 5. Redireciona o usuário para o Frontend com o token disponível
        return res.redirect(`${FRONTEND_URL}/dashboard?token=${token}`);
    } catch (err) {
        console.error('Erro durante o processamento do callback do Google:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
}

/**
 * Retorna os dados do usuário autenticado (Sessão atual).
 */
export async function getMe(req, res) {
    try {
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        console.error('Erro ao buscar dados do usuário autenticado:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao consultar dados do usuário.'
        });
    }
}

/**
 * Realiza o logout do usuário limpando o cookie de sessão.
 */
export function logout(req, res) {
    res.clearCookie('token', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({
        status: 'success',
        message: 'Logout realizado com sucesso.'
    });
}

export default {
    googleLogin,
    googleCallback,
    getMe,
    logout
};
