# Manta — Job Application Manager

## 1. Visão Geral

### Objetivo

O Manta é um gerenciador de candidaturas de emprego que permite centralizar e organizar vagas de diferentes plataformas de recrutamento em um único ambiente.

O objetivo é proporcionar ao usuário maior controle sobre seus processos seletivos, permitindo acompanhar o andamento de cada candidatura, organizar prioridades e armazenar informações relevantes sobre as vagas.

### Funcionalidades principais

Cada usuário poderá:

- Cadastrar novas candidaturas.
- Anexar currículos às candidaturas.
- Atualizar o status de cada processo seletivo.
- Organizar candidaturas por prioridade.
- Adicionar anotações individuais às candidaturas.
- Consultar e editar as informações de suas candidaturas.
- Excluir candidaturas.

### Integração com plataformas externas

Uma funcionalidade planejada é a integração com diferentes plataformas de recrutamento.

Quando tecnicamente possível, o sistema deverá conseguir obter automaticamente informações de uma vaga, como:

- Descrição da vaga.
- Nome da empresa.
- Salário proposto.
- Requisitos e qualificações.
- Link original da candidatura.

A viabilidade dessas integrações dependerá da disponibilidade de APIs públicas, permissões e mecanismos de acesso oferecidos pelas plataformas.

---

## 2. Funcionamento do Sistema

### Usuários

Cada usuário possui uma conta individual, autenticada por meio do Google OAuth.

Os dados de cada usuário são armazenados no MongoDB.

### Candidaturas

Cada candidatura pertence a um único usuário.

O usuário possui permissões para:

- Criar candidaturas.
- Consultar suas próprias candidaturas.
- Atualizar informações das candidaturas.
- Excluir candidaturas.

Nenhum usuário poderá consultar ou modificar candidaturas pertencentes a outros usuários.

### Status das candidaturas

Cada candidatura possui um status que representa seu estágio atual no processo seletivo.

Status inicialmente previstos:

- Em andamento.
- Aguardando retorno.
- Esperando entrevista.
- Em entrevista.
- Aprovado.
- Reprovado.
- Desistência.

A lista poderá ser modificada conforme as necessidades do sistema.

### Prioridades

O usuário poderá organizar suas candidaturas por prioridade, permitindo identificar quais processos seletivos merecem maior atenção.

### Anotações

Cada candidatura poderá possuir anotações próprias, permitindo registrar informações importantes sobre conversas, entrevistas e etapas do processo seletivo.

### Currículos

O usuário poderá anexar um currículo a cada candidatura, mantendo uma referência ao documento utilizado naquele processo seletivo.

---

## 3. Usuários e Autenticação

### Cadastro e identificação

Cada usuário terá uma conta individual autenticada exclusivamente por meio do Google OAuth.

O sistema utilizará as informações fornecidas pelo Google para identificar e cadastrar os usuários.

O identificador único da conta Google (`sub`) será utilizado para vincular a identidade externa ao usuário armazenado no MongoDB.

Informações inicialmente armazenadas:

- Identificador Google (`googleId`).
- E-mail.
- Nome.
- Foto de perfil.
- Data de criação da conta.

### Autenticação

O processo de autenticação utilizará:

- Google OAuth / OpenID Connect para autenticação e identificação dos usuários.
- JWT (JSON Web Token) próprio do Manta para identificar usuários autenticados nas requisições à API.
- Verificação dos tokens JWT nas rotas protegidas.

O backend será responsável por validar a identidade fornecida pelo Google, identificar ou cadastrar o usuário e emitir seu próprio token de autenticação.

### Segurança

- Não haverá armazenamento de senhas locais.
- As credenciais e tokens recebidos do Google deverão ser validados adequadamente.
- Tokens JWT deverão ser validados antes de permitir acesso aos recursos protegidos.
- Os dados recebidos pela API deverão passar por validação.
- O acesso às candidaturas deverá respeitar a propriedade de cada usuário.
- Informações sensíveis não deverão ser expostas nas respostas da API.

---

## 4. Tecnologias

| Tecnologia | Responsabilidade                      |
| ---------- | ------------------------------------- |
| Node.js    | Ambiente de execução do backend     |
| Express    | Construção da API HTTP              |
| MongoDB    | Persistência dos dados               |
| Prisma     | ORM e acesso ao banco de dados        |
| React      | Construção da interface do usuário |

---

## 5. Arquitetura do Backend

A API será organizada em camadas com responsabilidades específicas.

### Models

Responsáveis pela comunicação com o banco de dados e execução das consultas necessárias.

Exemplos de operações:

- `findAll`
- `findById`
- `findByEmail`
- `exists`
- `create`
- `update`
- `delete`

Os Models utilizarão o Prisma para executar as operações no MongoDB.

### Routes

Responsáveis pela organização dos endpoints da API.

Cada conjunto de rotas deverá representar um recurso ou domínio do sistema.

Exemplos:

- Rotas de usuários.
- Rotas de autenticação.
- Rotas de candidaturas.

### Validators

Responsáveis por validar os dados recebidos nas requisições.

Exemplos:

- Campos obrigatórios.
- Formato de e-mail.
- Validação de identificadores.
- Estrutura dos dados enviados.
- Regras de preenchimento de candidaturas.

### Controllers

Responsáveis por controlar o fluxo das requisições HTTP e construir as respostas da API.

Recebem os dados validados, acionam as operações necessárias e retornam as respostas adequadas ao cliente.

### Outras camadas

A arquitetura poderá utilizar Middlewares para processos intermediários, como autenticação e autorização, e Services para centralizar regras de negócio quando necessário.

---

## 6. Estrutura Inicial do Projeto

```text
manta/
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── services/
│   │   ├── config/
│   │   └── app.js
│   │
│   ├── prisma/
│   │   └── schema.prisma
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   └── ...
│
└── context.md
```

---

## 7. Estado Atual do Desenvolvimento

### Em desenvolvimento

- API de usuários.
- API de autenticação.
- Configuração do MongoDB.
- Integração do Prisma com o banco de dados.
- Integração com Google OAuth.
- Geração e validação de JWT.

### Planejado

- API de candidaturas.
- Gerenciamento de currículos.
- Gerenciamento de prioridades.
- Gerenciamento de status.
- Sistema de anotações.
- Interface React.
- Integrações com plataformas de recrutamento.

---

## 8. Decisões Pendentes

- Definir estratégia de geração, expiração e renovação dos JWTs.
- Definir estrutura definitiva dos documentos no MongoDB.
- Definir armazenamento e gerenciamento dos currículos.
- Definir modelo de prioridades.
- Definir integração com plataformas externas.
- Definir padronização das respostas e erros da API.
