# Minha Saúde Feminina

Três projetos que compartilham a mesma API: backend, painel administrativo web e app mobile.

| Pasta | O que é | Stack |
|---|---|---|
| [`backend/`](backend) | API REST (artigos, categorias, autores, usuários, autenticação) | Node.js + Express |
| [`frontend/`](frontend) | Painel administrativo web | React + Vite + TypeScript |
| [`mobile/`](mobile) | App de leitura de conteúdo, com calendário menstrual | Expo (React Native) |

```
curricularizacao/
├── backend/    API REST (Express)
├── frontend/   Painel admin web
└── mobile/     App Expo
    └── minha-saude-feminina/
```

O painel web e o app consomem a mesma API. O calendário menstrual do app é a exceção: fica salvo só no dispositivo (`AsyncStorage`), sem chamada de rede.

## backend

Node.js + Express. Os dados ficam num arquivo JSON local (`src/data/db.json`), criado e semeado automaticamente na primeira execução. Não precisa instalar banco de dados.

- CRUD completo de artigos, categorias, autores e usuários
- Autenticação por sessão (email/senha, `Authorization: Bearer <token>`) ou por chave estática (`x-api-key`), ambas aceitas nas mesmas rotas
- Usuário administrador criado automaticamente no primeiro boot

```bash
cd backend
npm install
cp .env.example .env
npm run dev          # http://localhost:3333/api/v1
```

**Variáveis de ambiente (`.env`)**

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta em que a API sobe | `3333` |
| `ADMIN_API_KEY` | Chave estática para integrações/scripts (header `x-api-key`) | `admin-secret-key` |

**Endpoints principais**

| Recurso | Rotas |
|---|---|
| Autenticação | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| Usuários | `GET/POST /users`, `GET/PATCH/DELETE /users/:id` |
| Artigos | `GET/POST /articles`, `GET/PATCH/DELETE /articles/:id` |
| Categorias | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id` |
| Autores | `GET/POST /authors` |

Login padrão: `admin@minhasaudefeminina.com` / `admin123`.

## frontend

Painel web onde o conteúdo do app é criado e mantido.

- CRUD de artigos, com editor de texto rico (negrito, itálico, títulos, listas, cores, upload de imagem e embed de vídeo)
- CRUD de categorias e de usuários do painel (papéis admin/editor)
- Autor do artigo por texto livre com autocomplete: se o nome digitado não existir, é criado automaticamente
- Login por email/senha (padrão) ou por chave de API, ambos salvos localmente
- Toasts de sucesso/erro, estados de carregamento e de lista vazia em todas as telas

```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

**Variáveis de ambiente (`.env`)**

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL da API | `http://localhost:3333/api/v1` |

## mobile

App usado por quem lê conteúdo de saúde e por quem acompanha o próprio ciclo menstrual.

- Leitura de conteúdo (início, categorias, busca, detalhe de artigo), consumindo a mesma API do painel
- Meu Ciclo: calendário menstrual local, sem depender da API
  - Registro por data de fim ou por duração em dias, com máscara `DD/MM/AAAA`
  - Cálculo de dias férteis e previsão do próximo ciclo com base no histórico
  - Calendário em português, com detalhe ao tocar em qualquer dia
  - Edição e exclusão de registros, salvos com `AsyncStorage`
- Perfil: tela estática com dados do usuário local, sem cadastro nem login

```bash
cd mobile/minha-saude-feminina
npm install
cp .env.example .env
npm run web              # ou: npx expo start (Expo Go)
```

**Variáveis de ambiente (`.env`)**

| Variável | Descrição | Padrão |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL da API | `http://localhost:3333/api/v1/` |

## Rodando tudo junto

Suba o backend primeiro. O painel e as telas de conteúdo do app dependem dele.

```bash
# terminal 1
cd backend && npm install && cp .env.example .env && npm run dev

# terminal 2
cd frontend && npm install && cp .env.example .env && npm run dev

# terminal 3
cd mobile/minha-saude-feminina && npm install && cp .env.example .env && npm run web
```

| Serviço | URL padrão |
|---|---|
| API | `http://localhost:3333/api/v1` |
| Painel web | `http://localhost:5173` |
| App (Expo web) | `http://localhost:8081` |

Artigo, categoria ou autor criado/editado no painel aparece no app assim que a tela correspondente é recarregada.

## Convenções do repositório

- Este README documenta os três projetos. Cada pasta (`backend/`, `frontend/`, `mobile/minha-saude-feminina/`) tem só `.env.example` e `package.json`, sem README próprio.
- Sem banco de dados externo: o backend persiste em JSON local, o app persiste o calendário localmente no dispositivo.
