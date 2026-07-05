# Chat 5: Generated API Client

Work id: `5-generated-api-client`
Date: 2026-07-05
Related branch: `5-generated-api-client`
Related tasks:
- `docs/tasks/active/generated-api-client.md`

## Контекст

В этом чате нужно было сначала через grill-with-docs закрыть решения по generated TypeScript API client, затем реализовать package `@scheduling/api-client` поверх TypeSpec-generated OpenAPI.

## Мои промпты

### Prompt 1

`Делаем задачу [generated-api-client.md](docs/tasks/active/generated-api-client.md), сначала [$grill-with-docs](/Users/berdnikov/.agents/skills/grill-with-docs/SKILL.md) чтобы закрыть все моменты`

Ответ AI:
- Прочитал task, glossary, ADR, TypeSpec/OpenAPI contract, workspace scripts и package skeleton.
- Провел grill-сессию по форме client API, generated output, auth boundary, freshness source, package exports, generator choice, терминологии `User` vs `Organizer`, ADR и base URL.
- Сформировал итоговый decision-complete plan.

### Prompt 2

`делай план`

Ответ AI:
- Создал ветку `5-generated-api-client`.
- Реализовал generated API client, обновил contract terminology, добавил ADR и прогнал verification.
- Остановился до archive/commit/merge для human review.

### Prompt 3

`задача готова`

Ответ AI:
- Архивировал task, обновил roadmap и archive index.
- Добавил journal entry и подготовил финальный commit/merge по workflow.

## Мои решения

- Публичная форма `@scheduling/api-client`: typed fetch, а не full generated SDK.
- Generated client files коммитятся в репозиторий.
- Auth остается caller-owned; пакет не хранит token.
- `pnpm api:client:generate` сначала обновляет TypeSpec-generated OpenAPI.
- Package exports указывают на source `src/index.ts`, без `dist` build.
- Генератор: `openapi-typescript` + `openapi-fetch`.
- Контрактный `User` переименовать в `Organizer`.
- `LoginResponse.user` переименовать в `LoginResponse.organizer`.
- Выбор генератора зафиксировать отдельным ADR.
- `createApiClient` по умолчанию использует local Prism URL `http://localhost:4010`.

## Что сделал AI

- Добавил package scripts, exports и dependencies для `@scheduling/api-client`.
- Добавил `packages/api-client/src/index.ts` с typed client factory и exported aliases.
- Добавил generated types `packages/api-client/src/generated/openapi.d.ts`.
- Добавил type-level smoke test `packages/api-client/src/index.test-d.ts`.
- Переименовал `User` в `Organizer` в TypeSpec contract и regenerated OpenAPI.
- Добавил root script `api:client:generate`.
- Добавил ADR `docs/adr/0008-openapi-typescript-api-client.md`.
- После review архивировал task и обновил roadmap/archive index.

## Верификация

- `pnpm install`: lockfile/importer обновлен, dependencies установлены.
- `pnpm --filter @scheduling/api-client typecheck`: сначала RED на отсутствующем `src/index.ts`, затем pass.
- `pnpm api:generate`: TypeSpec успешно сгенерировал OpenAPI.
- `pnpm api:check`: успешно, проверено 19 required operations.
- `pnpm api:client:generate`: OpenAPI и generated client types успешно обновлены.
- `pnpm typecheck`: workspace typecheck успешно прошел.
- `git diff --check`: whitespace ошибок нет.

## Результат

Generated API client реализован, проверен и после human review архивирован. Финальный commit subject: `feat(api-client): add generated api client`.
