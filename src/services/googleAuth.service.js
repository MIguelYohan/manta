import { OAuth2Client } from 'google-auth-library';
import 'dotenv/config';

const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI = 'http://localhost:3030/auth/google/callback'
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Aviso: GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não definidos no .env');
}

const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
);

/**
 * Gera a URL oficial de autorização do Google para redirecionar o usuário.
 * 
 * @returns {string} URL de login do Google.
 */
export function getGoogleAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'openid',
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent'
    });
}

/**
 * Troca o código de autorização retornado pelo Google pelas informações de perfil do usuário.
 * 
 * @param {string} code - Código retornado na query string pelo Google (?code=...).
 * @returns {Promise<{ googleId: string, email: string, name: string, picture: string }>} Dados do perfil.
 */
export async function getUserInfoFromCode(code) {
    const { tokens } = await oauth2Client.getToken(code);

    const ticket = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture
    };
}

export default {
    getGoogleAuthUrl,
    getUserInfoFromCode
};
