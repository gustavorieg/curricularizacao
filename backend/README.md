# Minha Saúde Feminina — Backend

API REST em Node.js + Express que serve conteúdo de saúde da mulher (artigos, categorias,
autores) e autenticação/gestão de usuários para o [painel administrativo](../frontend) e o
[app mobile](../mobile).

Os dados são persistidos em um arquivo JSON local (`src/data/db.json`), criado e semeado
automaticamente com dados de exemplo (incluindo um usuário administrador) na primeira
execução. Não há dependência de banco de dados externo.

## Como subir

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

A API sobe em **`http://localhost:3333/api/v1`**. O comando `npm run dev` reinicia o
servidor automaticamente a cada alteração de código (`node --watch`).

### Login padrão (criado automaticamente)

Na primeira execução, um usuário administrador é semeado para permitir o primeiro login no
painel web:

- **Email:** `admin@minhasaudefeminina.com`
- **Senha:** `admin123`

Troque a senha ou crie outro usuário e remova este assim que possível (tela "Usuários" do
painel admin).

## Variáveis de ambiente (`.env`)

| Variável         | Descrição                                                                 | Padrão              |
|-------------------|-----------------------------------------------------------------------------|----------------------|
| `PORT`            | Porta em que a API sobe                                                     | `3333`               |
| `ADMIN_API_KEY`   | Chave estática opcional para integrações/scripts (header `x-api-key`)       | `admin-secret-key`   |

Endpoints de escrita aceitam **duas** formas de autenticação, ambas via `adminAuth`:
1. Header `x-api-key: <ADMIN_API_KEY>` — para scripts/integrações.
2. Header `Authorization: Bearer <token>` — token de sessão obtido em `POST /auth/login`,
   usado pelo painel web.

## Endpoints

### Autenticação

| Método | Rota           | Auth | Descrição                              |
|--------|----------------|------|------------------------------------------|
| POST   | `/auth/login`  | —    | `{ email, password }` → `{ token, user }` |
| POST   | `/auth/logout` | —    | Invalida o token enviado (se houver)     |
| GET    | `/auth/me`     | admin | Retorna o usuário da sessão atual       |

### Usuários (admin)

| Método | Rota          | Descrição                                  |
|--------|---------------|-----------------------------------------------|
| GET    | `/users`      | Lista usuários                                 |
| GET    | `/users/:id`  | Detalhe de um usuário                          |
| POST   | `/users`      | Cria usuário (`name`, `email`, `password`, `role: admin\|editor`) |
| PATCH  | `/users/:id`  | Edita usuário (senha opcional)                 |
| DELETE | `/users/:id`  | Remove usuário (bloqueado se for o único restante) |

### Artigos

| Método | Rota            | Auth  | Descrição                                             |
|--------|------------------|-------|--------------------------------------------------------|
| GET    | `/articles`      | —     | Lista paginada (`page`, `pageSize`, `q`/`search`, `categoryId`) |
| GET    | `/articles/:id`  | —     | Detalhe                                                 |
| POST   | `/articles`      | admin | Cria (`title`, `summary`, `content`, `categoryId`, `authorId`, `sources[]`) |
| PATCH  | `/articles/:id`  | admin | Edita (campos parciais)                                 |
| DELETE | `/articles/:id`  | admin | Remove                                                   |

### Categorias

| Método | Rota                    | Auth  | Descrição               |
|--------|--------------------------|-------|---------------------------|
| GET    | `/categories`            | —     | Lista ordenada por `displayOrder` |
| GET    | `/categories/:idOrSlug`  | —     | Detalhe                   |
| POST   | `/categories`            | admin | Cria                       |
| PATCH  | `/categories/:id`        | admin | Edita                       |
| DELETE | `/categories/:id`        | admin | Remove                       |

### Autores

| Método | Rota       | Auth | Descrição      |
|--------|------------|------|------------------|
| GET    | `/authors` | —    | Lista completa   |

## Estrutura

```
src/
├── app.js                    # setup do Express, CORS, montagem das rotas
├── server.js                 # ponto de entrada (lê PORT do .env)
├── data/
│   ├── store.js              # leitura/escrita do db.json, seed inicial, migração
│   └── db.json               # "banco de dados" (gerado automaticamente)
├── middleware/
│   └── admin-auth.js         # aceita x-api-key OU Bearer token de sessão
├── routes/
│   ├── auth.js                # login/logout/me
│   ├── users.js                # CRUD de usuários
│   ├── articles.js             # CRUD de artigos
│   ├── categories.js           # CRUD de categorias
│   └── authors.js              # leitura de autores
└── utils/
    └── api-error.js           # classe ApiError + handler central de erros
```

## Resetar dados

Apague `src/data/db.json` e reinicie o servidor — ele recria os dados de exemplo
(categorias, autores, artigos e o usuário administrador padrão).

## Quem consome esta API

- **[`../frontend`](../frontend)** — painel web administrativo (login, CRUD de artigos e usuários).
- **[`../mobile`](../mobile)** — app Expo (leitura de conteúdo: início, categorias, busca).
