# Chat 3: TypeSpec Contract

Work id: `3-typespec-contract`
Date: 2026-07-05
Related branch: `3-typespec-contract`
Related tasks:
- `docs/tasks/archive/2026-07-05-typespec-contract.md`

## Контекст

В этом чате нужно было сначала уточнить недостающие API-contract решения, затем реализовать первый roadmap task: полный TypeSpec-first MVP HTTP API и generated OpenAPI для Swagger, Prism, generated client и будущего backend.

## Мои промпты

### Prompt 1

`[$grill-me](/Users/berdnikov/.agents/skills/grill-me/SKILL.md) делаем задачу [typespec-contract.md](docs/tasks/active/typespec-contract.md), уточни недостающие требования, чтобы ты самостоятельно реализовал`

Ответ AI:
- Прочитал task, requirements, ADR и workspace state.
- Провел grill-сессию по недостающим контрактным решениям.
- Сформировал decision-complete plan для реализации.

### Prompt 2

`реализуй план`

Ответ AI:
- Создал ветку `3-typespec-contract`.
- Добавил TypeSpec source, OpenAPI emitter config, package scripts/dependencies и generated OpenAPI.
- Проверил генерацию, обязательные paths и Prism mock responses.
- Не стал коммитить и архивировать до human review.

### Prompt 3

`задача готова, в журнал зафиксируй промты и твои краткие ответы, чтобы было наглядно, давай это в правила зафиксируем, чтобы в будущем ты сам фиксировал`

Ответ AI:
- Обновил правила журнала и шаблон.
- Записал промпты и краткие ответы AI в эту journal entry.
- Архивировал завершенную задачу и подготовил финальный commit/merge.

## Мои решения

- Успешные API responses используют bare JSON без envelope.
- Ошибки имеют форму `{ code, message, details? }`.
- Auth использует email/password login, Bearer token и `user` в login response.
- Mutations возвращают актуальный ресурс, deletes возвращают `204`.
- Public booking create принимает `startAt`, `guestName`, `guestEmail`; `endAt` вычисляет backend.
- Public booking success возвращает confirmation DTO, не полный admin booking.
- Slots query использует inclusive local dates в `Europe/Moscow`, а слоты возвращаются UTC timestamps.
- Business-rule conflicts возвращают `409`.
- Command endpoints idempotent.
- Generated `openapi.yaml` является repo artifact.
- Journal entries должны фиксировать важные user prompts и краткий ответ AI рядом с каждым prompt.

## Что сделал AI

- Добавил `packages/api-contract/tsp/main.tsp` с моделями auth, event types, availability, bookings, public booking, slots, errors и всеми MVP endpoints.
- Добавил `packages/api-contract/tspconfig.yaml` для генерации `packages/api-contract/generated/openapi.yaml`.
- Добавил scripts `api:generate` и `api:mock`, TypeSpec/OpenAPI/Prism dependencies и обновил `pnpm-lock.yaml`.
- Сгенерировал OpenAPI с Bearer security, public no-auth overrides, examples и basic validation formats/patterns.
- Обновил journal rules в `docs/workflow.md`, `docs/journal/README.md` и `docs/journal/_template.md`.
- Архивировал task `typespec-contract`.

## Верификация

- `pnpm install`: установил TypeSpec/OpenAPI/Prism dependencies и обновил lockfile.
- `pnpm api:generate`: TypeSpec успешно компилируется и генерирует OpenAPI.
- Required paths check: все MVP paths из requirements присутствуют в generated OpenAPI.
- `git diff --check`: whitespace ошибок нет.
- `pnpm --filter @scheduling/api-contract run api:mock`: Prism стартует на generated OpenAPI.
- `curl POST /auth/login`: mock возвращает login example.
- `curl GET /event-types` с Bearer token: mock возвращает event type list example.
- `curl GET /public/event-types/intro-call/slots`: mock возвращает slot example.

## Результат

TypeSpec contract готов, generated OpenAPI сохранен в репозитории, задача архивирована после human review, а правила журнала дополнены требованием фиксировать важные промпты вместе с краткими ответами AI.
