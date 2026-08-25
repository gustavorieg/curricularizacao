# Minha Saúde Feminina — App (Expo)

App mobile/web (React Native + Expo Router) para conteúdo de saúde da mulher, consumindo o
[backend](../backend) que também serve o [painel administrativo](../frontend). Inclui um
calendário menstrual local ("Meu Ciclo").

> O código do app fica em [`minha-saude-feminina/`](minha-saude-feminina). Este README dá a
> visão geral; detalhes de setup, telas e implementação estão no
> [README do app](minha-saude-feminina/README.md).

## Como subir

> Pré-requisito: o [backend](../backend) precisa estar rodando (por padrão em
> `http://localhost:3333/api/v1`) para as telas de conteúdo funcionarem.

```bash
cd mobile/minha-saude-feminina
npm install
cp .env.example .env   # ajuste a URL da API se necessário
npm run web             # ou: npx expo start (escaneie o QR code com Expo Go)
```

## O que o app faz

- **Início / Categorias / Buscar / Perfil** — consomem a API de conteúdo (`GET /articles`,
  `GET /categories`), a mesma alimentada pelo [painel admin](../frontend).
- **Meu Ciclo** — calendário menstrual 100% local (AsyncStorage, sem dependência da API):
  registro de períodos, cálculo de dias férteis e previsão do próximo ciclo, visualização em
  calendário (`react-native-calendars`).
- **Gerenciar categorias** — CRUD simples autenticado por chave de API (`x-api-key`), pensado
  como recurso interno/temporário.

## Tecnologias

- Expo SDK 54, React 19, React Native 0.81, Expo Router 6, TypeScript
- `@react-native-async-storage/async-storage` (persistência local do ciclo)
- `react-native-calendars` (visualização de calendário)

## Variáveis de ambiente (`.env`)

| Variável                     | Descrição                                              | Padrão                          |
|-------------------------------|-----------------------------------------------------------|-----------------------------------|
| `EXPO_PUBLIC_API_BASE_URL`    | Base URL da API                                            | `http://localhost:3333/api/v1/`  |
| `EXPO_PUBLIC_ADMIN_API_KEY`   | Chave de admin, usada apenas na tela de gerenciar categorias | `admin-secret-key`               |

Variáveis `EXPO_PUBLIC_*` ficam visíveis no bundle entregue ao usuário — use a chave de admin
apenas em ambiente interno/desenvolvimento.

Veja mais detalhes (estrutura de pastas, rotas, camada de API, lógica do calendário) no
[README do app](minha-saude-feminina/README.md).
