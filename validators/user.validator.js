/**
 * Validador para os dados de usuário.
 *
 * @param {object} user - Objeto contendo os dados do usuário.
 * @returns {{ status: "success" | "error", message: string }} Resultado da validação.
 */
export default function validateUser(user) {
    if (!user || typeof user !== 'object' || Array.isArray(user)) {
        return {
            status: 'error',
            message: 'Formato inválido: os dados enviados devem ser um objeto.'
        };
    }

    const allowedKeys = ['email', 'name', 'password'];
    const receivedKeys = Object.keys(user);

    // Validação de campos não permitidos
    for (const key of receivedKeys) {
        if (!allowedKeys.includes(key)) {
            return {
                status: 'error',
                message: `Campo '${key}' não é permitido.`
            };
        }
    }

    // Validação do campo email
    if (typeof user.email !== 'string' || user.email.trim() === '') {
        return {
            status: 'error',
            message: "O campo 'email' é obrigatório e deve ser preenchido."
        };
    }

    // Validação semântica de formato de email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(user.email.trim())) {
        return {
            status: 'error',
            message: 'O e-mail informado possui um formato inválido.'
        };
    }

    // Validação do campo password
    if (typeof user.password !== 'string' || user.password.length === 0) {
        return {
            status: 'error',
            message: "O campo 'password' é obrigatório e deve ser preenchido."
        };
    }

    // Validação do campo name (opcional)
    if (user.name !== undefined && typeof user.name !== 'string') {
        return {
            status: 'error',
            message: "O campo 'name' deve ser uma string quando fornecido."
        };
    }

    return {
        status: 'success',
        message: 'Usuário validado com sucesso.'
    };
}
