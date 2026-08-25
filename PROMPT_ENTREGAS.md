# Prompts - Entregas Semana 1

## 🎯 Contexto Geral

**Prazo:** Até sexta 28 ago 2026, 23:59 (3 dias 4 horas)

Duas entregas paralelas, reutilizando a API existente em `C:\Users\Gustavo\Documents\Faculdade\curricularizacao\minha-saude-feminina-api`.

---

## 📋 ENTREGA 1: Gestão de Artigos (Web Admin)

**Criar:** `C:\Users\Gustavo\Documents\Faculdade\curricularizacao\frontend`

### Requisitos:
- **Tech stack:** React (Vite ou Next.js, sua escolha), TypeScript
- **CRUD de artigos:** criar, editar, listar, deletar artigos
- **Editor de texto rico:** usar biblioteca pronta (ex: `react-quill`, `tiptap`, `slate`) para:
  - Formatação (negrito, itálico, títulos, listas, cores)
  - Upload/embed de imagens
  - Embed de vídeos (YouTube, Vimeo, ou HTML5)
- **Campos do artigo:** title, summary, content (rich), categoryId, authorId, sources (URL + título + descrição)
- **Autenticação simples:** input de chave API (`x-api-key`) na header, salvar em localStorage
- **Integração com API existente:**
  - Endpoints já existem: `GET /articles`, `POST /articles`, `PATCH /articles/:id`, `DELETE /articles/:id`
  - **SE NÃO EXISTIREM:** estenda a API com `POST /articles`, `PATCH /articles/:id`, `DELETE /articles/:id` (antes era só leitura)
- **Atualização em tempo real no app:** após salvar um artigo, o app Expo deve exibir/atualizar automaticamente (app faz polling ou SSE, ou manual ao reabrir a tela)
- **Responsividade:** desktop-first, mas funcional em tablets

### Prioridade: MÁXIMA

---

## 📱 ENTREGA 2: Calendário Menstrual (App Expo)

**Estender:** `C:\Users\Gustavo\Documents\Faculdade\curricularizacao\expogo\minha-saude-feminina`

### Requisitos:
- **Nova tela no app:** "Calendário" ou "Meu Ciclo" (adicionar tab ou navegação)
- **Funcionalidades:**
  1. **Registro do ciclo:** input para data de início e data de término (ou duração)
  2. **Armazenamento local:** usar AsyncStorage (Expo) ou SQLite para persitir registros
  3. **Visualização em calendário:** componente React Native de calendário exibindo:
     - Dias do ciclo marcados (ex: vermelho/rosa para menstruação)
     - Dias férteis calculados
  4. **Cálculo de ciclo:** lógica para prever próxima data (baseado em histórico ou ciclo padrão 28 dias)
  5. **Consulta de registros:** listar/editar/deletar ciclos já registrados
- **Persistência:** tudo local no AsyncStorage (sem dependência de API para isso)
- **Cálculo de próximo ciclo:** exibir data estimada do próximo período
- **Validações:** datas válidas, início antes do fim, não sobrepor ciclos

### Prioridade: MÁXIMA

---

## 🔌 Estensão da API (se necessário)

Caso a API ainda não tenha endpoints de escrita para artigos, adicione:

- `POST /articles` — criar artigo (admin, header `x-api-key`)
- `PATCH /articles/:id` — editar artigo (admin)
- `DELETE /articles/:id` — deletar artigo (admin)

Reutilize a mesma autenticação de admin (`x-api-key`) das categorias.

---

## 📦 Estrutura de Pastas Final

```
C:\Users\Gustavo\Documents\Faculdade\curricularizacao\
├── minha-saude-feminina-api/          (API — apenas estender se necessário)
├── expogo/
│   └── minha-saude-feminina/          (App — adicionar tela Calendário)
└── frontend/                          (NOVO — Web admin)
    ├── src/
    │   ├── components/
    │   │   ├── ArticleForm.tsx         (form com rich editor)
    │   │   ├── ArticleList.tsx
    │   │   ├── AuthKeyInput.tsx        (input de chave API)
    │   │   └── RichEditor.tsx          (wrapper do editor)
    │   ├── pages/
    │   │   ├── ArticlesPage.tsx
    │   │   └── LoginPage.tsx
    │   ├── services/
    │   │   └── article-service.ts      (chamadas à API)
    │   ├── App.tsx
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts (ou next.config.js)
    └── README.md
```

---

## ✅ Checklist de Entrega

### Entrega 1 (Web Admin):
- [ ] CRUD de artigos funcional
- [ ] Editor rich text com formatação, imagens e vídeos
- [ ] Autenticação via chave API
- [ ] Integração com API (criar/editar/deletar)
- [ ] App recebe atualizações após salvar artigos na web
- [ ] Projeto roda com `npm run dev`
- [ ] README com instruções de setup

### Entrega 2 (Calendário):
- [ ] Nova tela de calendário no app
- [ ] Registro de início/fim de ciclo
- [ ] Armazenamento local (AsyncStorage)
- [ ] Visualização em calendário (dias marcados)
- [ ] Cálculo de próximo ciclo
- [ ] Consulta/edição/deleção de registros
- [ ] Validações de data
- [ ] App roda com `npm run dev`

---

## 🚀 Próximos Passos

1. **Para Web Admin:** Crie a pasta `frontend` e inicie um projeto React/Vite
2. **Para Calendário:** Estenda o app Expo com nova tela e lógica de ciclo
3. **Teste integração:** confirme que web admin e app mobile funcionam juntos
4. **Submeta até 28 ago 23:59**

---

## 📞 Dúvidas?

- API base: `http://localhost:3333/api/v1`
- Chave admin: `admin-secret-key` (ou a configurada em `.env`)
- Tipos de dados: ver `expogo/minha-saude-feminina/src/types/`
