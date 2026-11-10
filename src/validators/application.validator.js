/**
 * Lista de status válidos para as candidaturas, alinhados ao CONTEXT.md
 */
export const VALID_STATUSES = [
    'IN_PROGRESS',          // Em andamento
    'WAITING_RESPONSE',     // Aguardando retorno
    'WAITING_INTERVIEW',    // Esperando entrevista
    'INTERVIEW',            // Em entrevista
    'APPROVED',             // Aprovado
    'REJECTED',             // Reprovado
    'WITHDRAWN'             // Desistência
];

const ALLOWED_FIELDS = [
    'company',
    'description',
    'url',
    'status',
    'priority',
    'resumeUrl',
    'notes'
];

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Valida se uma string é um ObjectId válido do MongoDB (24 caracteres hexadecimais).
 * 
 * @param {string} id
 * @returns {{ status: "success" | "error", message?: string }}
 */
export function validateObjectId(id) {
    if (!id || typeof id !== 'string' || !OBJECT_ID_REGEX.test(id)) {
        return {
            status: 'error',
            message: 'O ID informado é inválido. Deve ser um ObjectId de 24 caracteres hexadecimais.'
        };
    }

    return { status: 'success' };
}

/**
 * Valida se uma URL possui formato semântico válido (HTTP/HTTPS).
 * 
 * @param {string} urlString
 * @returns {boolean}
 */
function isValidUrl(urlString) {
    try {
        const parsed = new URL(urlString);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Validador para a criação de uma nova candidatura (POST).
 * 
 * @param {object} data - Dados recebidos no body da requisição.
 * @returns {{ status: "success" | "error", message?: string, sanitizedData?: object }}
 */
export function validateCreateApplication(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {
            status: 'error',
            message: 'Formato inválido: os dados da candidatura devem ser um objeto JSON.'
        };
    }

    // Rejeita campos desconhecidos
    for (const key of Object.keys(data)) {
        if (!ALLOWED_FIELDS.includes(key)) {
            return {
                status: 'error',
                message: `Campo não permitido: '${key}'.`
            };
        }
    }

    // Campo obrigatório: company
    if (typeof data.company !== 'string' || data.company.trim() === '') {
        return {
            status: 'error',
            message: "O campo 'company' é obrigatório e deve ser uma string preenchida."
        };
    }

    if (data.company.trim().length > 150) {
        return {
            status: 'error',
            message: "O campo 'company' não pode ter mais de 150 caracteres."
        };
    }

    // Campo opcional: description
    if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
        return {
            status: 'error',
            message: "O campo 'description' deve ser uma string quando fornecido."
        };
    }

    // Campo opcional: url
    if (data.url !== undefined && data.url !== null && data.url !== '') {
        if (typeof data.url !== 'string' || !isValidUrl(data.url.trim())) {
            return {
                status: 'error',
                message: "O campo 'url' deve ser uma URL válida (ex: https://exemplo.com/vaga)."
            };
        }
    }

    // Campo opcional: status
    const status = data.status ? data.status.trim().toUpperCase() : 'IN_PROGRESS';
    if (!VALID_STATUSES.includes(status)) {
        return {
            status: 'error',
            message: `Status inválido '${data.status}'. Status permitidos: ${VALID_STATUSES.join(', ')}.`
        };
    }

    // Campo opcional: priority
    let priority = 0;
    if (data.priority !== undefined && data.priority !== null) {
        if (!Number.isInteger(data.priority) || data.priority < 0 || data.priority > 5) {
            return {
                status: 'error',
                message: "O campo 'priority' deve ser um número inteiro entre 0 e 5."
            };
        }
        priority = data.priority;
    }

    // Campo opcional: resumeUrl
    if (data.resumeUrl !== undefined && data.resumeUrl !== null && data.resumeUrl !== '') {
        if (typeof data.resumeUrl !== 'string' || !isValidUrl(data.resumeUrl.trim())) {
            return {
                status: 'error',
                message: "O campo 'resumeUrl' deve ser uma URL válida para o currículo."
            };
        }
    }

    // Campo opcional: notes
    if (data.notes !== undefined && data.notes !== null && typeof data.notes !== 'string') {
        return {
            status: 'error',
            message: "O campo 'notes' deve ser uma string quando fornecido."
        };
    }

    return {
        status: 'success',
        sanitizedData: {
            company: data.company.trim(),
            description: data.description ? data.description.trim() : null,
            url: data.url ? data.url.trim() : null,
            status,
            priority,
            resumeUrl: data.resumeUrl ? data.resumeUrl.trim() : null,
            notes: data.notes ? data.notes.trim() : null
        }
    };
}

/**
 * Validador para a atualização de uma candidatura existente (PUT).
 * 
 * @param {object} data - Dados parciais recebidos no body da requisição.
 * @returns {{ status: "success" | "error", message?: string, sanitizedData?: object }}
 */
export function validateUpdateApplication(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return {
            status: 'error',
            message: 'Formato inválido: os dados para atualização devem ser um objeto JSON.'
        };
    }

    const keys = Object.keys(data);
    if (keys.length === 0) {
        return {
            status: 'error',
            message: 'Nenhum dado fornecido para atualização.'
        };
    }

    // Rejeita campos desconhecidos ou imutáveis
    for (const key of keys) {
        if (!ALLOWED_FIELDS.includes(key)) {
            return {
                status: 'error',
                message: `Campo '${key}' não é permitido para atualização.`
            };
        }
    }

    const sanitizedData = {};

    // Atualização de company (se enviada)
    if (data.company !== undefined) {
        if (typeof data.company !== 'string' || data.company.trim() === '') {
            return {
                status: 'error',
                message: "O campo 'company' não pode ser vazio."
            };
        }
        if (data.company.trim().length > 150) {
            return {
                status: 'error',
                message: "O campo 'company' não pode ter mais de 150 caracteres."
            };
        }
        sanitizedData.company = data.company.trim();
    }

    // Atualização de description
    if (data.description !== undefined) {
        if (data.description !== null && typeof data.description !== 'string') {
            return {
                status: 'error',
                message: "O campo 'description' deve ser uma string."
            };
        }
        sanitizedData.description = data.description ? data.description.trim() : null;
    }

    // Atualização de url
    if (data.url !== undefined) {
        if (data.url !== null && data.url !== '') {
            if (typeof data.url !== 'string' || !isValidUrl(data.url.trim())) {
                return {
                    status: 'error',
                    message: "O campo 'url' deve ser uma URL válida."
                };
            }
            sanitizedData.url = data.url.trim();
        } else {
            sanitizedData.url = null;
        }
    }

    // Atualização de status
    if (data.status !== undefined) {
        if (typeof data.status !== 'string') {
            return {
                status: 'error',
                message: "O campo 'status' deve ser uma string."
            };
        }
        const status = data.status.trim().toUpperCase();
        if (!VALID_STATUSES.includes(status)) {
            return {
                status: 'error',
                message: `Status inválido '${data.status}'. Status permitidos: ${VALID_STATUSES.join(', ')}.`
            };
        }
        sanitizedData.status = status;
    }

    // Atualização de priority
    if (data.priority !== undefined) {
        if (!Number.isInteger(data.priority) || data.priority < 0 || data.priority > 5) {
            return {
                status: 'error',
                message: "O campo 'priority' deve ser um número inteiro entre 0 e 5."
            };
        }
        sanitizedData.priority = data.priority;
    }

    // Atualização de resumeUrl
    if (data.resumeUrl !== undefined) {
        if (data.resumeUrl !== null && data.resumeUrl !== '') {
            if (typeof data.resumeUrl !== 'string' || !isValidUrl(data.resumeUrl.trim())) {
                return {
                    status: 'error',
                    message: "O campo 'resumeUrl' deve ser uma URL válida."
                };
            }
            sanitizedData.resumeUrl = data.resumeUrl.trim();
        } else {
            sanitizedData.resumeUrl = null;
        }
    }

    // Atualização de notes
    if (data.notes !== undefined) {
        if (data.notes !== null && typeof data.notes !== 'string') {
            return {
                status: 'error',
                message: "O campo 'notes' deve ser uma string."
            };
        }
        sanitizedData.notes = data.notes ? data.notes.trim() : null;
    }

    return {
        status: 'success',
        sanitizedData
    };
}

export default {
    VALID_STATUSES,
    validateObjectId,
    validateCreateApplication,
    validateUpdateApplication
};
