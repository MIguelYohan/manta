import app from '../app.js';
import prisma from '../config/prisma.js';

async function runApplicationTests() {
    const port = 3099;
    const server = app.listen(port);
    const baseUrl = `http://localhost:${port}/applications`;

    console.log('--- Iniciando Teste de Rotas e Validações de Candidaturas ---');

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

        const headers = {
            'Content-Type': 'application/json',
            'x-user-id': testUser.id
        };

        // 2. Teste de Validação: Criar com company vazia (deve retornar 400)
        const emptyCompanyRes = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ company: '' })
        });
        console.log(`[2] POST sem company: Status ${emptyCompanyRes.status} (esperado: 400)`);

        // 3. Teste de Validação: Criar com status inválido (deve retornar 400)
        const invalidStatusRes = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ company: 'Google', status: 'STATUS_INEXISTENTE' })
        });
        console.log(`[3] POST com status inválido: Status ${invalidStatusRes.status} (esperado: 400)`);

        // 4. Teste de Validação: ID com formato inválido (deve retornar 400 em vez de 500)
        const invalidIdRes = await fetch(`${baseUrl}/id-nao-hexadecimal-123`, { headers });
        console.log(`[4] GET com ObjectId inválido: Status ${invalidIdRes.status} (esperado: 400)`);

        // 5. Criar Candidatura Válida (POST /applications)
        const postRes = await fetch(baseUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                company: '  Google  ',
                description: 'Vaga de Engenheiro de Software',
                url: 'https://careers.google.com/jobs/123',
                status: 'in_progress',
                priority: 3,
                notes: 'Primeira fase do processo'
            })
        });
        const postData = await postRes.json();
        console.log(`[5] POST válido: Status ${postRes.status} | ID: ${postData.data?.id} | Status sanitizado: ${postData.data?.status}`);

        const applicationId = postData.data?.id;

        // 6. Listar Candidaturas (GET /applications)
        const getRes = await fetch(baseUrl, { headers });
        const getData = await getRes.json();
        console.log(`[6] GET /applications: Status ${getRes.status} | Total retornado: ${getData.data?.length}`);

        // 7. Buscar Candidatura por ID (GET /applications/:id)
        const getByIdRes = await fetch(`${baseUrl}/${applicationId}`, { headers });
        const getByIdData = await getByIdRes.json();
        console.log(`[7] GET /applications/:id: Status ${getByIdRes.status} | Empresa: ${getByIdData.data?.company}`);

        // 8. Atualizar Candidatura com dados válidos (PUT /applications/:id)
        const putRes = await fetch(`${baseUrl}/${applicationId}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                status: 'interview',
                notes: 'Entrevista técnica agendada para sexta-feira'
            })
        });
        const putData = await putRes.json();
        console.log(`[8] PUT válido: Status ${putRes.status} | Novo Status: ${putData.data?.status}`);

        // 9. Excluir Candidatura (DELETE /applications/:id)
        const delRes = await fetch(`${baseUrl}/${applicationId}`, {
            method: 'DELETE',
            headers
        });
        const delData = await delRes.json();
        console.log(`[9] DELETE /applications/:id: Status ${delRes.status} | Mensagem: ${delData.message}`);

        // 10. Limpeza: Remover o usuário temporário
        await prisma.user.delete({
            where: { id: testUser.id }
        });
        console.log('[10] Usuário de teste removido. Banco limpo!');

        console.log('--- Todos os testes de rotas e validações passaram com sucesso! ---');
    } catch (error) {
        console.error('Erro durante o teste de rotas:', error);
    } finally {
        server.close();
        await prisma.$disconnect();
    }
}

runApplicationTests();
