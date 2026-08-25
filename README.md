# Minha Saúde Feminina

Plataforma de conteúdo e acompanhamento de saúde da mulher, composta por três projetos independentes que compartilham a mesma API:

| Pasta | O que é | Stack |
|---|---|---|
| [`backend/`](backend) | API REST — artigos, categorias, autores, usuários e autenticação | Node.js + Express |
| [`frontend/`](frontend) | Painel administrativo web para gerenciar o conteúdo | React + Vite + TypeScript |
| [`mobile/`](mobile) | Aplicativo para quem consome o conteúdo, com calendário menstrual | Expo (React Native) |

```
curricularizacao/
├── backend/    # API REST (Express) — fonte da verdade dos dados
├── frontend/   # Painel admin web — cria/edita artigos, categorias e usuários
└── mobile/     # App Expo — leitura de conteúdo + calendário menstrual local
    └── minha-saude-feminina/
```

O **backend** é o único ponto de persistência: tanto o painel quanto o app consomem a mesma API. O calendário menstrual do app é a exceção — vive inteiramente no dispositivo (`AsyncStorage`), sem nenhuma chamada de rede.

## Visão geral de cada projeto

### `backend/` — API

Node.js + Express, com os dados persistidos em um arquivo JSON local (`src/data/db.json`), semeado automaticamente na primeira execução — não é necessário instalar nem configurar banco de dados externo.

- CRUD completo de **artigos**, **categorias**, **autores** e **usuários**
- **Autenticação dupla**: sessão por `email`/`senha` (`Authorization: Bearer <token>`) para o painel, ou chave estática (`x-api-key`) para scripts/integrações — ambas aceitas nas mesmas rotas
- Usuário administrador semeado automaticamente no primeiro boot

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

Login padrão semeado automaticamente: `admin@minhasaudefeminina.com` / `admin123`.

### `frontend/` — Painel administrativo

Interface web onde o conteúdo exibido no app é criado e mantido.

- CRUD de artigos com **editor de texto rico** (negrito, itálico, títulos, listas, cores, upload de imagem e embed de vídeo do YouTube/Vimeo/arquivo)
- CRUD de categorias e de usuários do painel (papéis admin/editor)
- Autor do artigo por **texto livre com autocomplete** — se o nome digitado não existir, é criado automaticamente
- Login por email/senha (padrão) ou por chave de API, ambos persistidos localmente
- Feedback visual em todas as ações: toasts de sucesso/erro, estados de carregamento e vazios

```bash
cd frontend
npm install
cp .env.example .env   # aponte para a URL da API
npm run dev             # http://localhost:5173
```

**Variáveis de ambiente (`.env`)**

| Variável | Descrição | Padrão |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL da API | `http://localhost:3333/api/v1` |

### `mobile/` — App Expo

App que dois públicos usam: quem lê o conteúdo de saúde, e quem acompanha o próprio ciclo menstrual.

- **Leitura de conteúdo** (somente leitura): início, categorias, busca e detalhe de artigo, consumindo a mesma API do painel
- **Meu Ciclo** — calendário menstrual 100% local, sem depender da API:
  - Registro de período por data de fim ou por duração em dias, com máscara `DD/MM/AAAA`
  - Cálculo de dias férteis e previsão do próximo ciclo com base no histórico
  - Calendário visual localizado em português, com detalhe ao tocar em qualquer dia
  - Edição e exclusão de registros, com persistência via `AsyncStorage`
- **Perfil** — tela estática com dados apenas do usuário local (nenhum cadastro/login é exigido)

```bash
cd mobile/minha-saude-feminina
npm install
cp .env.example .env    # ajuste a URL da API se necessário
npm run web              # ou: npx expo start (Expo Go)
```

**Variáveis de ambiente (`.env`)**

| Variável | Descrição | Padrão |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL da API | `http://localhost:3333/api/v1/` |

## Rodando tudo junto

A ordem recomendada é subir o backend primeiro — tanto o painel quanto as telas de conteúdo do app dependem dele.

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

Qualquer artigo, categoria ou autor criado/editado no painel fica disponível para o app assim que a tela correspondente é recarregada — não há necessidade de reiniciar nada.

## Convenções do repositório

- Este README é a documentação central dos três projetos; cada pasta (`backend/`, `frontend/`, `mobile/minha-saude-feminina/`) tem apenas seu `.env.example` e `package.json`, sem README próprio.
- Não há banco de dados externo: o backend persiste em JSON local, e o app persiste o calendário localmente no dispositivo.
- `PROMPT_ENTREGAS.md` documenta o escopo original das entregas desta etapa do projeto.
