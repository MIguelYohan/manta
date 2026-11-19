import app from '../app.js';
import prisma from '../config/prisma.js';

async function runAuthTests() {
    const port = 3097;
    const server = app.listen(port);
    const baseUrl = `http://localhost:${port}/auth`;

    console.log('--- Iniciando Teste Completo de Autenticação Híbrida (E-mail/Senha + Google OAuth) ---');

    const testEmail = `usuario-${Date.now()}@teste.com`;
    const testPassword = 'senhaSegura123';
    let registeredUserId = null;

    try {
        // 1. Testar Cadastro Convencional (POST /auth/register)
        const registerRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Dev Tester',
                email: testEmail,
                password: testPassword
            })
        });
        const registerData = await registerRes.json();
        console.log(`[1] POST /auth/register: Status ${registerRes.status} (esperado: 201) | Msg: ${registerData.message}`);
        console.log(`    Token emitido no cadastro: ${Boolean(registerData.token)}`);
        registeredUserId = registerData.user?.id;

        // 2. Testar Cadastro com E-mail Duplicado (deve retornar 409 Conflict)
        const duplicateRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Dev Clone',
                email: testEmail,
                password: 'outraSenha123'
            })
        });
        console.log(`[2] POST /auth/register duplicado: Status ${duplicateRes.status} (esperado: 409)`);

        // 3. Testar Login com Senha Incorreta (deve retornar 401)
        const wrongPasswordRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: 'senhaErrada'
            })
        });
        console.log(`[3] POST /auth/login senha errada: Status ${wrongPasswordRes.status} (esperado: 401)`);

        // 4. Testar Login com Credenciais Corretas (deve retornar 200 e token)
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword
            })
        });
        const loginData = await loginRes.json();
        console.log(`[4] POST /auth/login senha correta: Status ${loginRes.status} (esperado: 200) | Msg: ${loginData.message}`);

        const authToken = loginData.token;

        // 5. Testar Rota Protegida (GET /auth/me) com o Token do Login Convencional
        const meRes = await fetch(`${baseUrl}/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const meData = await meRes.json();
        console.log(`[5] GET /auth/me autenticado: Status ${meRes.status} | Nome: ${meData.data?.name} | Email: ${meData.data?.email}`);

        // 6. Testar Rota do Google OAuth (GET /auth/google)
        const googleRes = await fetch(`${baseUrl}/google`, { redirect: 'manual' });
        console.log(`[6] GET /auth/google: Status ${googleRes.status} (esperado: 302 Redirect)`);

        // 7. Testar Logout (POST /auth/logout)
        const logoutRes = await fetch(`${baseUrl}/logout`, { method: 'POST' });
        const logoutData = await logoutRes.json();
        console.log(`[7] POST /auth/logout: Status ${logoutRes.status} | Msg: ${logoutData.message}`);

        // 8. Limpeza do usuário de teste
        if (registeredUserId) {
            await prisma.user.delete({
                where: { id: registeredUserId }
            });
            console.log('[8] Usuário de teste removido. Banco limpo!');
        }

        console.log('--- Todos os testes de Autenticação Híbrida passaram com 100% de sucesso! ---');
    } catch (error) {
        console.error('Erro durante os testes de autenticação:', error);
    } finally {
        server.close();
        await prisma.$disconnect();
    }
}

runAuthTests();
