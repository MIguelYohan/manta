const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Valida os dados para cadastro convencional de usuário (POST /auth/register).
 * 
 * @param {object} data - Dados recebidos na requisição ({ email, password, name }).
 * @returns {{ status: "success" | "error", message?: string }}
 */
export function validateRegister(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {
            status: 'error',
            message: 'Formato inválido: os dados enviados devem ser um objeto JSON.'
        };
    }

    const { email, password, name } = data;

    // Validação de email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return {
            status: 'error',
            message: 'O campo email é obrigatório e deve possuir um formato válido.'
        };
    }

    // Validação de senha
    if (!password || typeof password !== 'string') {
        return {
            status: 'error',
            message: 'O campo password é obrigatório e deve ser uma string.'
        };
    }

    if (password.length < 6) {
        return {
            status: 'error',
            message: 'A senha deve conter no mínimo 6 caracteres.'
        };
    }

    if (password.length > 100) {
        return {
            status: 'error',
            message: 'A senha não pode ultrapassar 100 caracteres.'
        };
    }

    // Validação de nome (opcional)
    if (name !== undefined && name !== null && typeof name !== 'string') {
        return {
            status: 'error',
            message: 'O campo name deve ser uma string quando fornecido.'
        };
    }

    return { status: 'success' };
}

/**
 * Valida os dados para login convencional (POST /auth/login).
 * 
 * @param {object} data - Dados recebidos na requisição ({ email, password }).
 * @returns {{ status: "success" | "error", message?: string }}
 */
export function validateLogin(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {
            status: 'error',
            message: 'Formato inválido: os dados enviados devem ser um objeto JSON.'
        };
    }

    const { email, password } = data;

    if (!email || typeof email !== 'string' || email.trim() === '') {
        return {
            status: 'error',
            message: 'O campo email é obrigatório.'
        };
    }

    if (!password || typeof password !== 'string' || password === '') {
        return {
            status: 'error',
            message: 'O campo password é obrigatório.'
        };
    }

    return { status: 'success' };
}

export default {
    validateRegister,
    validateLogin
};
