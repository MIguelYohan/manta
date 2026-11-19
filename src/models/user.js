import prisma from '../config/prisma.js';

/**
 * Model responsável pelas operações de banco de dados do Usuário (User).
 * Suporta autenticação híbrida: Google OAuth e credenciais convencionais (E-mail e Senha).
 */

/**
 * Busca um usuário pelo ID único interno do MongoDB (ObjectId).
 * 
 * @param {string} id - ID do usuário no MongoDB.
 * @returns {Promise<object|null>} Usuário encontrado ou null.
 */
export async function findById(id) {
    return await prisma.user.findUnique({
        where: { id }
    });
}

/**
 * Busca um usuário pelo identificador único da conta Google (googleId / claim 'sub').
 * 
 * @param {string} googleId - Identificador único retornado pelo Google.
 * @returns {Promise<object|null>} Usuário encontrado ou null.
 */
export async function findByGoogleId(googleId) {
    return await prisma.user.findUnique({
        where: { googleId }
    });
}

/**
 * Busca um usuário pelo endereço de e-mail.
 * 
 * @param {string} email - Endereço de e-mail do usuário.
 * @returns {Promise<object|null>} Usuário encontrado ou null.
 */
export async function findByEmail(email) {
    return await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
    });
}

/**
 * Cria um novo usuário cadastrado com E-mail e Senha.
 * 
 * @param {object} userData
 * @param {string} userData.email - E-mail do usuário.
 * @param {string} userData.password - Senha criptografada (hash).
 * @param {string} [userData.name] - Nome do usuário.
 * @returns {Promise<object>} Usuário criado.
 */
export async function createWithPassword({ email, password, name }) {
    return await prisma.user.create({
        data: {
            email: email.toLowerCase().trim(),
            password,
            name: name ? name.trim() : null
        }
    });
}

/**
 * Atualiza os dados de perfil de um usuário existente.
 * 
 * @param {string} id - ID do usuário no MongoDB.
 * @param {object} data - Dados a serem atualizados (name, picture, etc.).
 * @returns {Promise<object>} Usuário atualizado.
 */
export async function update(id, data) {
    const { id: _, googleId: __, createdAt, ...updateData } = data;

    return await prisma.user.update({
        where: { id },
        data: updateData
    });
}

/**
 * Localiza um usuário pelo googleId ou email e atualiza/cria o registro.
 * Vincula automaticamente o Google a um usuário já existente por e-mail.
 * 
 * @param {object} userData - Dados providos pelo Google OAuth.
 * @returns {Promise<object>} Usuário encontrado, vinculado ou criado.
 */
export async function upsertByGoogle(userData) {
    const { googleId, email, name, picture } = userData;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verifica se já existe por googleId
    const existingByGoogle = await findByGoogleId(googleId);
    if (existingByGoogle) {
        return await prisma.user.update({
            where: { id: existingByGoogle.id },
            data: {
                name: name || existingByGoogle.name,
                picture: picture || existingByGoogle.picture
            }
        });
    }

    // 2. Se não achou por googleId, verifica se já existe uma conta por e-mail (cadastrada com senha)
    const existingByEmail = await findByEmail(normalizedEmail);
    if (existingByEmail) {
        // Vincula o googleId à conta existente
        return await prisma.user.update({
            where: { id: existingByEmail.id },
            data: {
                googleId,
                name: existingByEmail.name || name,
                picture: existingByEmail.picture || picture
            }
        });
    }

    // 3. Se não existe por nenhum dos dois, cria um novo usuário
    return await prisma.user.create({
        data: {
            googleId,
            email: normalizedEmail,
            name,
            picture
        }
    });
}

/**
 * Remove a conta de um usuário e suas candidaturas associadas.
 * 
 * @param {string} id - ID do usuário no MongoDB.
 * @returns {Promise<object>} Usuário removido.
 */
export async function remove(id) {
    await prisma.application.deleteMany({
        where: { userId: id }
    });

    return await prisma.user.delete({
        where: { id }
    });
}

export default {
    findById,
    findByGoogleId,
    findByEmail,
    createWithPassword,
    update,
    upsertByGoogle,
    remove
};
