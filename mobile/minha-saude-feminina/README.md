# Minha Saúde Feminina — App (Expo)

App mobile (React Native + Expo Router) com conteúdo de saúde da mulher e um calendário
menstrual local.

## Setup

```bash
npm install
cp .env.example .env   # ajuste a URL da API se necessário
npm run web             # ou: npx expo start  (escaneie o QR code com Expo Go)
```

### Variáveis de ambiente (`.env`)

| Variável                        | Descrição                                    |
|----------------------------------|-----------------------------------------------|
| `EXPO_PUBLIC_API_BASE_URL`       | Base URL da API (ex: `http://localhost:3333/api/v1/`) |
| `EXPO_PUBLIC_ADMIN_API_KEY`      | Chave de admin, usada apenas em telas internas de teste |

A API `minha-saude-feminina-api` precisa estar rodando para as telas de conteúdo
(Início, Categorias, Buscar) funcionarem.

## Telas

- **Início / Categorias / Buscar / Perfil** — consomem a API de conteúdo.
- **Meu Ciclo** — calendário menstrual, 100% local (sem dependência de API).

## Meu Ciclo — calendário menstrual

Tela em `app/(tabs)/meu-ciclo.tsx`. Funcionalidades:

- Registro de ciclo (data de início e fim da menstruação).
- Persistência local via `@react-native-async-storage/async-storage`
  (`services/cycle-storage-service.ts`).
- Visualização em calendário (`react-native-calendars`): dias de menstruação em
  vermelho/rosa, dias férteis estimados em lavanda, próximo período estimado destacado.
- Cálculo de dias férteis: 5 dias antes da ovulação estimada até o dia da ovulação
  (ovulação = 14 dias antes do próximo período — fase lútea padrão).
- Previsão do próximo ciclo: usa a média de dias entre os inícios dos ciclos registrados
  (quando há 2+ registros) ou um ciclo padrão de 28 dias (quando há apenas 1 registro).
- Listagem, edição e exclusão de registros anteriores.
- Validações: datas no formato `AAAA-MM-DD`, data de fim não anterior à de início, e
  bloqueio de sobreposição entre períodos registrados.

Toda a lógica de cálculo/validação é pura e testável em `lib/cycle-calculations.ts`.

### Notas de implementação

- `Alert.alert` do React Native não exibe nada no Web (react-native-web não implementa
  esse diálogo), então a confirmação de exclusão usa `window.confirm` no Web e
  `Alert.alert` nativo em iOS/Android — ver `lib/confirm.ts`.
- Os dados do ciclo ficam isolados por navegador/dispositivo (AsyncStorage local); não há
  sincronização entre dispositivos.

## Integração com o Web Admin

O app consome `GET /articles` e `GET /categories` da mesma API usada pelo painel
administrativo (`../../frontend`). Artigos criados/editados/deletados no painel aparecem
no app assim que a tela correspondente é recarregada (pull-to-refresh ou reabertura).
