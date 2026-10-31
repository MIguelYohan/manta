import prisma from '../config/prisma.js';

/**
 * Model responsável pelas operações de banco de dados das Candidaturas (Applications).
 * Todas as operações exigem obrigatoriamente o `userId`, garantindo o isolamento
 * de dados e que nenhum usuário consiga acessar, modificar ou excluir registros de terceiros.
 */

/**
 * Busca todas as candidaturas de um usuário específico, com suporte a filtros e ordenação.
 * 
 * @param {string} userId - ID do usuário autenticado.
 * @param {object} [filters={}] - Filtros opcionais (status, search, orderBy).
 * @returns {Promise<Array>} Lista de candidaturas do usuário.
 */
export async function findAll(userId, filters = {}) {
    const { status, search, orderBy = { createdAt: 'desc' } } = filters;

    const where = {
        userId
    };

    if (status) {
        where.status = status;
    }

    if (search) {
        where.company = {
            contains: search,
            mode: 'insensitive'
        };
    }

    return await prisma.application.findMany({
        where,
        orderBy
    });
}

/**
 * Busca uma candidatura específica por ID, garantindo a posse pelo usuário.
 * 
 * @param {string} userId - ID do usuário autenticado.
 * @param {string} applicationId - ID da candidatura.
 * @returns {Promise<object|null>} Candidatura encontrada ou null se não pertencer ao usuário.
 */
export async function findById(userId, applicationId) {
    return await prisma.application.findFirst({
        where: {
            id: applicationId,
            userId
        }
    });
}

/**
 * Cria uma nova candidatura vinculada exclusivamente ao usuário informado.
 * 
 * @param {string} userId - ID do usuário autenticado.
 * @param {object} data - Dados da candidatura (company, description, url, status, priority, resumeUrl, notes).
 * @returns {Promise<object>} Candidatura criada.
 */
export async function create(userId, data) {
    const {
        company,
        description,
        url,
        status,
        priority,
        resumeUrl,
        notes
    } = data;

    return await prisma.application.create({
        data: {
            userId,
            company,
            description,
            url,
            status,
            priority,
            resumeUrl,
            notes
        }
    });
}

/**
 * Atualiza os dados de uma candidatura existente, desde que pertença ao usuário.
 * 
 * @param {string} userId - ID do usuário autenticado.
 * @param {string} applicationId - ID da candidatura.
 * @param {object} data - Dados a serem atualizados.
 * @returns {Promise<object|null>} Candidatura atualizada ou null se não existir/não pertencer ao usuário.
 */
export async function update(userId, applicationId, data) {
    // Garante primeiro que a candidatura pertence ao usuário
    const application = await findById(userId, applicationId);
    if (!application) {
        return null;
    }

    // Impede alteração acidental de userId ou id
    const { id, userId: _, createdAt, ...updateData } = data;

    return await prisma.application.update({
        where: { id: applicationId },
        data: updateData
    });
}

/**
 * Remove uma candidatura existente, desde que pertença ao usuário.
 * 
 * @param {string} userId - ID do usuário autenticado.
 * @param {string} applicationId - ID da candidatura.
 * @returns {Promise<object|null>} Candidatura removida ou null se não existir/não pertencer ao usuário.
 */
export async function remove(userId, applicationId) {
    // Garante primeiro que a candidatura pertence ao usuário
    const application = await findById(userId, applicationId);
    if (!application) {
        return null;
    }

    return await prisma.application.delete({
        where: { id: applicationId }
    });
}

/**
 * Conta o número de candidaturas do usuário (opcionalmente filtrando por status).
 * 
 * @param {string} userId - ID do usuário autenticado.
 * @param {string} [status] - Status opcional para contagem.
 * @returns {Promise<number>} Quantidade de candidaturas.
 */
export async function count(userId, status) {
    const where = { userId };
    if (status) {
        where.status = status;
    }

    return await prisma.application.count({ where });
}

// Export default contendo todas as operações agrupadas
export default {
    findAll,
    findById,
    create,
    update,
    remove,
    count
};
