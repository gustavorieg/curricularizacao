# Minha Saúde Feminina — Web Admin

Painel administrativo web (React + Vite + TypeScript) para gestão de artigos e usuários da
API [`../backend`](../backend). É por aqui que o conteúdo exibido no [app mobile](../mobile)
é criado e mantido.

## Como subir

> Pré-requisito: o [backend](../backend) precisa estar rodando (por padrão em
> `http://localhost:3333/api/v1`) — veja o README dele para subir a API primeiro.

```bash
cd frontend
npm install
cp .env.example .env   # ajuste a URL da API se necessário
npm run dev
```

A aplicação abre em **`http://localhost:5173`**.

### Login padrão

Ao subir o backend pela primeira vez, um usuário administrador é criado automaticamente:

- **Email:** `admin@minhasaudefeminina.com`
- **Senha:** `admin123`

Recomenda-se trocar a senha (ou criar um novo usuário e remover este) após o primeiro
acesso, na tela "Usuários".

### Pré-requisitos para criar artigos

É necessário ter pelo menos uma categoria e um autor cadastrados na API para poder criar
artigos (ambos já vêm com dados de seed por padrão, então funciona logo de início).

## Funcionalidades

- Login com email/senha, autenticado contra a API (`POST /auth/login`). O token de sessão
  é salvo em `localStorage` e enviado como `Authorization: Bearer <token>` em todas as
  requisições.
- CRUD completo de artigos: listar (com busca), criar, editar e deletar (com confirmação).
- Editor de texto rico (react-quill-new): negrito, itálico, títulos H1-H3, listas, cores,
  upload de imagem (embutida como data URL) e embed de vídeo (YouTube, Vimeo ou arquivo
  direto `.mp4/.webm/.ogg`).
- Gerenciamento de fontes do artigo (título + URL + descrição).
- Seleção de categoria e autor via dropdowns alimentados pela API.
- CRUD completo de usuários do painel (nome, email, senha, papel admin/editor). Não é
  possível remover o único usuário restante.

## Variáveis de ambiente (`.env`)

| Variável              | Descrição                          | Padrão                         |
|------------------------|-------------------------------------|---------------------------------|
| `VITE_API_BASE_URL`    | Base URL da API                     | `http://localhost:3333/api/v1` |

## Integração com o app mobile

O [app mobile](../mobile) consome a mesma API (`GET /articles`, `GET /categories`).
Qualquer criação/edição/exclusão de artigo feita aqui é persistida em `db.json` no backend
e aparece no app assim que a tela correspondente é recarregada (pull-to-refresh ou
reabertura da tela) — não é preciso reiniciar nada.

## Estrutura

```
src/
├── components/       # ArticleForm, RichEditor, SourcesEditor, UserForm, AppLayout, ProtectedRoute
├── context/          # AuthContext (token + usuario logado em localStorage)
├── pages/            # LoginPage, ArticlesPage, ArticleFormPage, UsersPage, UserFormPage
├── services/         # api-client (axios + Bearer token), auth/article/category/author/user-service
└── types/            # tipos compartilhados (Article, Category, Author, User, ...)
```

## Endpoints da API utilizados

- `POST /auth/login` — autenticação, retorna token + usuário
- `POST /auth/logout` — invalida o token atual
- `GET /categories`, `GET /authors` — dropdowns
- `GET /articles` — listagem (com `q` para busca)
- `GET /articles/:id` — carregar artigo para edição
- `POST /articles`, `PATCH /articles/:id`, `DELETE /articles/:id` — CRUD de artigos (autenticado)
- `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id` — CRUD de usuários (autenticado)

Veja [`../backend/README.md`](../backend/README.md) para a referência completa da API.
