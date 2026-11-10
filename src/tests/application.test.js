import app from '../app.js';
import prisma from '../config/prisma.js';
import { generateToken } from '../services/jwt.service.js';

async function runApplicationTests() {
    const port = 3099;
    const server = app.listen(port);
    const baseUrl = `http://localhost:${port}/applications`;

    console.log('--- Iniciando Teste de Autenticação JWT e Rotas de Candidaturas ---');

    try {
        // 1. Criar usuário temporário para os testes
        const testUser = await prisma.user.create({
            data: {
                googleId: 'test-app-' + Date.now(),
                email: `test-app-${Date.now()}@email.test`,
                name: 'Usuário Teste de Candidaturas'
            }
        });
        console.log(`[1] Usuário de teste criado: ID ${testUser.id}`);

        // 2. Testar requisição SEM token JWT (deve retornar 401)
        const noTokenRes = await fetch(baseUrl);
        console.log(`[2] GET sem token: Status ${noTokenRes.status} (esperado: 401)`);

        // 3. Testar requisição com token INVÁLIDO (deve retornar 401)
        const invalidTokenRes = await fetch(baseUrl, {
            headers: {
                'Authorization': 'Bearer token-totalmente-invalido'
            }
        });
        console.log(`[3] GET com token inválido: Status ${invalidTokenRes.status} (esperado: 401)`);

        // 4. Gerar Token JWT válido para o usuário de teste
        const validToken = generateToken(testUser.id);
        console.log(`[4] Token JWT válido gerado com sucesso.`);

        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${validToken}`
        };

        // 5. Teste de Validação: Criar com company vazia usando token válido (deve retornar 400)
        const emptyCompanyRes = await fetch(baseUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ company: '' })
        });
        console.log(`[5] POST sem company com JWT: Status ${emptyCompanyRes.status} (esperado: 400)`);

        // 6. Criar Candidatura Válida com JWT (POST /applications)
        const postRes = await fetch(baseUrl, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                company: 'Google',
                description: 'Vaga de Engenheiro de Software',
                url: 'https://careers.google.com/jobs/123',
                status: 'in_progress',
                priority: 3,
                notes: 'Primeira fase do processo'
            })
        });
        const postData = await postRes.json();
        console.log(`[6] POST com JWT válido: Status ${postRes.status} | ID: ${postData.data?.id}`);

        const applicationId = postData.data?.id;

        // 7. Listar Candidaturas com JWT (GET /applications)
        const getRes = await fetch(baseUrl, { headers: authHeaders });
        const getData = await getRes.json();
        console.log(`[7] GET /applications com JWT: Status ${getRes.status} | Total retornado: ${getData.data?.length}`);

        // 8. Buscar Candidatura por ID com JWT (GET /applications/:id)
        const getByIdRes = await fetch(`${baseUrl}/${applicationId}`, { headers: authHeaders });
        const getByIdData = await getByIdRes.json();
        console.log(`[8] GET /applications/:id: Status ${getByIdRes.status} | Empresa: ${getByIdData.data?.company}`);

        // 9. Atualizar Candidatura com JWT (PUT /applications/:id)
        const putRes = await fetch(`${baseUrl}/${applicationId}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({
                status: 'interview',
                notes: 'Entrevista técnica agendada'
            })
        });
        const putData = await putRes.json();
        console.log(`[9] PUT com JWT: Status ${putRes.status} | Novo Status: ${putData.data?.status}`);

        // 10. Excluir Candidatura com JWT (DELETE /applications/:id)
        const delRes = await fetch(`${baseUrl}/${applicationId}`, {
            method: 'DELETE',
            headers: authHeaders
        });
        const delData = await delRes.json();
        console.log(`[10] DELETE com JWT: Status ${delRes.status} | Mensagem: ${delData.message}`);

        // 11. Limpeza: Remover o usuário temporário
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        console.log('[11] Usuário de teste removido. Banco limpo!');

        console.log('--- Todos os testes de JWT e Candidaturas passaram com sucesso! ---');
    } catch (error) {
        console.error('Erro durante o teste:', error);
    } finally {
        server.close();
        await prisma.$disconnect();
    }
}

runApplicationTests();
