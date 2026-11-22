const API_BASE_URL = 'http://localhost:3030';

/**
 * Utilitário central de requisições HTTP para a API Manta
 * Configurado com credentials: 'include' para tráfego automático de Cookies HttpOnly
 */
export async function apiRequest(endpoint, options = {}) {
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        },
        credentials: 'include'
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(data.message || 'Erro ao processar requisição');
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    } catch (err) {
        if (!err.status && err.name === 'TypeError') {
            const networkError = new Error('Não foi possível conectar ao servidor. Verifique se o backend está em execução.');
            networkError.status = 503;
            throw networkError;
        }
        throw err;
    }
}

/**
 * Serviços de Autenticação (Híbrida: E-mail/Senha + Google OAuth)
 */
export const authService = {
    // URL direta para acionar o fluxo oficial do Google OAuth no Backend
    loginWithGoogleUrl: `${API_BASE_URL}/auth/google`,

    // Cadastro convencional: POST /auth/register
    register: (userData) => apiRequest('/auth/register', {
        method: 'POST',
        body: userData
    }),

    // Login convencional: POST /auth/login
    login: (credentials) => apiRequest('/auth/login', {
        method: 'POST',
        body: credentials
    }),

    // Consulta perfil do usuário autenticado na sessão atual: GET /auth/me
    getMe: () => apiRequest('/auth/me', {
        method: 'GET'
    }),

    // Encerramento da sessão (limpa cookie): POST /auth/logout
    logout: () => apiRequest('/auth/logout', {
        method: 'POST'
    })
};

/**
 * Serviços de Candidaturas (CRUD completo)
 */
export const applicationsService = {
    // Listar candidaturas do usuário (suporta ?status=... e ?search=...)
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.orderBy) params.append('orderBy', filters.orderBy);
        if (filters.order) params.append('order', filters.order);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        return apiRequest(`/applications${queryString}`, { method: 'GET' });
    },

    // Buscar candidatura por ID
    getById: (id) => apiRequest(`/applications/${id}`, { method: 'GET' }),

    // Criar nova candidatura
    create: (data) => apiRequest('/applications', {
        method: 'POST',
        body: data
    }),

    // Atualizar candidatura
    update: (id, data) => apiRequest(`/applications/${id}`, {
        method: 'PUT',
        body: data
    }),

    // Deletar candidatura
    remove: (id) => apiRequest(`/applications/${id}`, {
        method: 'DELETE'
    })
};

export default {
    authService,
    applicationsService
};
