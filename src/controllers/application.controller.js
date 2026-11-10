import ApplicationModel from '../models/application.js';
import {
    validateObjectId,
    validateCreateApplication,
    validateUpdateApplication
} from '../validators/application.validator.js';

/**
 * Controller responsável pelo fluxo de requisições e respostas das Candidaturas (Applications).
 * Valida a identidade do usuário e os dados de entrada via Validators antes de acionar o Model.
 */

/**
 * Extrai o identificador do usuário autenticado provido pelo authMiddleware.
 */
function extractUserId(req) {
    return req.user?.id;
}

/**
 * Lista todas as candidaturas do usuário autenticado, com filtros opcionais.
 * 
 * Query params opcionais:
 * - status: Filtra por status (ex: "IN_PROGRESS", "INTERVIEW", etc.)
 * - search: Busca por nome da empresa
 * - orderBy: Campo de ordenação ("createdAt" ou "priority")
 * - order: Direção da ordenação ("asc" ou "desc")
 */
export async function getAll(req, res) {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou identificador não fornecido.'
            });
        }

        const { status, search, orderBy = 'createdAt', order = 'desc' } = req.query;

        const filters = {
            status,
            search,
            orderBy: {
                [orderBy]: order.toLowerCase() === 'asc' ? 'asc' : 'desc'
            }
        };

        const applications = await ApplicationModel.findAll(userId, filters);

        return res.status(200).json({
            status: 'success',
            data: applications
        });
    } catch (error) {
        console.error('Erro ao listar candidaturas:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao consultar as candidaturas.'
        });
    }
}

/**
 * Obtém uma candidatura específica por ID.
 */
export async function getById(req, res) {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou identificador não fornecido.'
            });
        }

        const { id } = req.params;

        // Validação do formato do ObjectId do MongoDB
        const idValidation = validateObjectId(id);
        if (idValidation.status === 'error') {
            return res.status(400).json(idValidation);
        }

        const application = await ApplicationModel.findById(userId, id);

        if (!application) {
            return res.status(404).json({
                status: 'error',
                message: 'Candidatura não encontrada.'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: application
        });
    } catch (error) {
        console.error('Erro ao buscar candidatura:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao consultar a candidatura.'
        });
    }
}

/**
 * Cria uma nova candidatura para o usuário autenticado.
 */
export async function create(req, res) {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou identificador não fornecido.'
            });
        }

        // Validação completa dos dados de entrada
        const validation = validateCreateApplication(req.body);
        if (validation.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: validation.message
            });
        }

        const newApplication = await ApplicationModel.create(userId, validation.sanitizedData);

        return res.status(201).json({
            status: 'success',
            message: 'Candidatura cadastrada com sucesso.',
            data: newApplication
        });
    } catch (error) {
        console.error('Erro ao criar candidatura:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao cadastrar a candidatura.'
        });
    }
}

/**
 * Atualiza uma candidatura existente pertencente ao usuário.
 */
export async function update(req, res) {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou identificador não fornecido.'
            });
        }

        const { id } = req.params;

        // Validação do formato do ObjectId do MongoDB
        const idValidation = validateObjectId(id);
        if (idValidation.status === 'error') {
            return res.status(400).json(idValidation);
        }

        // Validação dos dados a atualizar
        const validation = validateUpdateApplication(req.body);
        if (validation.status === 'error') {
            return res.status(400).json({
                status: 'error',
                message: validation.message
            });
        }

        const updatedApplication = await ApplicationModel.update(userId, id, validation.sanitizedData);

        if (!updatedApplication) {
            return res.status(404).json({
                status: 'error',
                message: 'Candidatura não encontrada ou você não tem permissão para editá-la.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Candidatura atualizada com sucesso.',
            data: updatedApplication
        });
    } catch (error) {
        console.error('Erro ao atualizar candidatura:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao atualizar a candidatura.'
        });
    }
}

/**
 * Remove uma candidatura existente pertencente ao usuário.
 */
export async function remove(req, res) {
    try {
        const userId = extractUserId(req);
        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'Usuário não autenticado ou identificador não fornecido.'
            });
        }

        const { id } = req.params;

        // Validação do formato do ObjectId do MongoDB
        const idValidation = validateObjectId(id);
        if (idValidation.status === 'error') {
            return res.status(400).json(idValidation);
        }

        const deletedApplication = await ApplicationModel.remove(userId, id);

        if (!deletedApplication) {
            return res.status(404).json({
                status: 'error',
                message: 'Candidatura não encontrada ou você não tem permissão para excluí-la.'
            });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Candidatura excluída com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao remover candidatura:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Erro interno ao excluir a candidatura.'
        });
    }
}

export default {
    getAll,
    getById,
    create,
    update,
    remove
};
