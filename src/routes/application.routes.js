import express from 'express';
import {
    getAll,
    getById,
    create,
    update,
    remove
} from '../controllers/application.controller.js';

const router = express.Router();

/**
 * Rotas de Gerenciamento de Candidaturas (Applications)
 * Prefixo configurado no app: /applications
 */

// Listar todas as candidaturas do usuário (com suporte a filtros por query params)
router.get('/', getAll);

// Buscar uma candidatura específica pelo ID
router.get('/:id', getById);

// Criar uma nova candidatura
router.post('/', create);

// Atualizar os dados de uma candidatura existente
router.put('/:id', update);

// Remover uma candidatura existente
router.delete('/:id', remove);

export default router;
