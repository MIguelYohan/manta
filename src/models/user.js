import prisma from '../config/prisma.js';

/**
 * Model responsável pelas operações de banco de dados do Usuário (User).
 * Gerencia a persistência dos dados de identificação providos pelo Google OAuth.
 */

/**
 * Busca um usuário pelo ID único interno do MongoDB (ObjectId).
 * Utilizado principalmente pelo middleware de autenticação JWT e consulta de perfil.
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
 * Utilizado durante o fluxo de login via Google OAuth.
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
        where: { email }
    });
}

/**
 * Cria um novo usuário no banco de dados após a primeira autenticação via Google.
 * 
 * @param {object} userData - Dados do usuário.
 * @param {string} userData.googleId - Identificador único do Google.
 * @param {string} userData.email - E-mail retornado pelo Google.
 * @param {string} [userData.name] - Nome completo do usuário.
 * @param {string} [userData.picture] - URL da foto de perfil.
 * @returns {Promise<object>} Usuário criado.
 */
export async function create(userData) {
    const { googleId, email, name, picture } = userData;

    return await prisma.user.create({
        data: {
            googleId,
            email,
            name,
            picture
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
    // Impede alteração acidental de chaves imutáveis
    const { id: _, googleId: __, createdAt, ...updateData } = data;

    return await prisma.user.update({
        where: { id },
        data: updateData
    });
}

/**
 * Localiza um usuário pelo googleId ou cria um novo registro caso não exista.
 * Atualiza automaticamente o nome e a foto caso tenham mudado no Google.
 * 
 * @param {object} userData - Dados providos pelo Google OAuth.
 * @returns {Promise<object>} Usuário encontrado ou criado.
 */
export async function upsertByGoogle(userData) {
    const { googleId, email, name, picture } = userData;

    return await prisma.user.upsert({
        where: { googleId },
        update: {
            email,
            name,
            picture
        },
        create: {
            googleId,
            email,
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
    // Remove as candidaturas do usuário antes de remover a conta
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
    create,
    update,
    upsertByGoogle,
    remove
};
