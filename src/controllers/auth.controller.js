import bcrypt from 'bcryptjs';
import UserModel from '../models/user.js';
import { getGoogleAuthUrl, getUserInfoFromCode } from '../services/googleAuth.service.js';
import { generateToken } from '../services/jwt.service.js';
import { validateRegister, validateLogin } from '../validators/auth.validator.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Helper para configurar o Cookie HttpOnly de autenticação.
 */
function setTokenCookie(res, token) {
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });
}

/**
 * Cadastro convencional com E-mail e Senha (POST /auth/register).
 */
export async function register(req, res) {
    try {
        const validation = validateRegister(req.body);
        if (validation.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: validation.message
            });
        }

        const { email, password, name } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Verifica se já existe um usuário cadastrado com este e-mail
        const existingUser = await UserModel.findByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: 'Já existe uma conta cadastrada com este endereço de e-mail.'
            });
        }

        // Criptografa a senha com salt de 10 rounds
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria o usuário no MongoDB
        const newUser = await UserModel.createWithPassword({
            email: normalizedEmail,
            password: hashedPassword,
            name
        });

        // Emite o token JWT
        const token = generateToken(newUser.id);
        setTokenCookie(res, token);

        return res.status(201).json({
            status: 'success',
            message: 'Conta criada com sucesso!',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                picture: newUser.picture
            }
        });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao realizar o cadastro.'
        });
    }
}

/**
 * Login convencional com E-mail e Senha (POST /auth/login).
 */
export async function login(req, res) {
    try {
        const validation = validateLogin(req.body);
        if (validation.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: validation.message
            });
        }

        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Busca o usuário pelo e-mail
        const user = await UserModel.findByEmail(normalizedEmail);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'E-mail ou senha incorretos.'
            });
        }

        // Se o usuário foi criado exclusivamente via Google OAuth e não possui senha
        if (!user.password) {
            return res.status(400).json({
                status: 'error',
                message: 'Esta conta foi criada com o Google. Por favor, utilize o botão "Entrar com o Google".'
            });
        }

        // Compara o hash da senha
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                status: 'error',
                message: 'E-mail ou senha incorretos.'
            });
        }

        // Emite o token JWT
        const token = generateToken(user.id);
        setTokenCookie(res, token);

        return res.status(200).json({
            status: 'success',
            message: 'Login realizado com sucesso!',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture
            }
        });
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao realizar o login.'
        });
    }
}

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
        const userInfo = await getUserInfoFromCode(code);
        const user = await UserModel.upsertByGoogle(userInfo);
        const token = generateToken(user.id);

        setTokenCookie(res, token);

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
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                createdAt: user.createdAt
            }
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
    register,
    login,
    googleLogin,
    googleCallback,
    getMe,
    logout
};
