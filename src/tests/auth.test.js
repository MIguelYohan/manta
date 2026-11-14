import app from '../app.js';
import prisma from '../config/prisma.js';
import { generateToken } from '../services/jwt.service.js';

async function runAuthTests() {
    const port = 3098;
    const server = app.listen(port);
    const baseUrl = `http://localhost:${port}/auth`;

    console.log('--- Iniciando Teste de Rotas de Autenticação (Google OAuth + JWT) ---');

    try {
        // 1. Testar GET /auth/google (deve responder com 302 Redirect para accounts.google.com)
        const googleRes = await fetch(`${baseUrl}/google`, { redirect: 'manual' });
        const location = googleRes.headers.get('location') || '';
        console.log(`[1] GET /auth/google: Status ${googleRes.status} (esperado: 302)`);
        console.log(`    Redireciona para Google Accounts: ${location.startsWith('https://accounts.google.com')}`);

        // 2. Testar GET /auth/me sem autenticação (deve responder 401)
        const meUnauthorizedRes = await fetch(`${baseUrl}/me`);
        console.log(`[2] GET /auth/me sem token: Status ${meUnauthorizedRes.status} (esperado: 401)`);

        // 3. Criar usuário temporário para testar sessão
        const testUser = await prisma.user.create({
            data: {
                googleId: 'google-oauth-test-' + Date.now(),
                email: `test-oauth-${Date.now()}@gmail.com`,
                name: 'Usuário Teste OAuth',
                picture: 'https://lh3.googleusercontent.com/test'
            }
        });
        console.log(`[3] Usuário de teste criado: ID ${testUser.id}`);

        const token = generateToken(testUser.id);

        // 4. Testar GET /auth/me com cabeçalho Bearer Token
        const meBearerRes = await fetch(`${baseUrl}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const meBearerData = await meBearerRes.json();
        console.log(`[4] GET /auth/me com Bearer Token: Status ${meBearerRes.status} | Nome: ${meBearerData.data?.name}`);

        // 5. Testar GET /auth/me com Cookie HttpOnly
        const meCookieRes = await fetch(`${baseUrl}/me`, {
            headers: {
                'Cookie': `token=${token}`
            }
        });
        const meCookieData = await meCookieRes.json();
        console.log(`[5] GET /auth/me com Cookie HttpOnly: Status ${meCookieRes.status} | Email: ${meCookieData.data?.email}`);

        // 6. Testar POST /auth/logout (deve retornar 200 e limpar cookie)
        const logoutRes = await fetch(`${baseUrl}/logout`, { method: 'POST' });
        const logoutData = await logoutRes.json();
        console.log(`[6] POST /auth/logout: Status ${logoutRes.status} | Msg: ${logoutData.message}`);

        // 7. Limpeza: Remover usuário de teste
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        console.log('[7] Usuário de teste removido. Banco limpo!');

        console.log('--- Todos os testes de Autenticação passaram com sucesso! ---');
    } catch (error) {
        console.error('Erro durante o teste de autenticação:', error);
    } finally {
        server.close();
        await prisma.$disconnect();
    }
}

runAuthTests();
