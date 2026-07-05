# Chat 4: OpenAPI Contract Check

Work id: `4-openapi-contract-check`
Date: 2026-07-05
Related branch: `4-openapi-contract-check`
Related tasks:
- `docs/tasks/active/openapi-contract-check.md`

## Контекст

В этом чате нужно было добавить guardrail для generated OpenAPI: автоматическую проверку, что MVP endpoints не пропали из TypeSpec-generated контракта.

## Мои промпты

### Prompt 1

`Делаем задачу [openapi-contract-check.md](docs/tasks/active/openapi-contract-check.md), сначала [$grill-me](/Users/berdnikov/web/learning/ai-workshop/project-v2/.agents/skills/grill-me/SKILL.md), чтобы закрыть все вопросы`

Ответ AI:
- Прочитал task, текущий API contract package, generated OpenAPI, requirements и workflow.
- Провел grill-сессию по формату проверки, dependency, scripts, списку обязательных operations и ожидаемому выводу.
- Сформировал итоговый план реализации.

### Prompt 2

`да`

Ответ AI:
- Зафиксировал решения grill-сессии по одному: проверять `method + path`, не запрещать лишние endpoints, добавить `yaml`, брать 19 MVP operations из requirements, не запускать генерацию внутри check, добавить package/root scripts, печатать краткий success output.

### Prompt 3

`сгенерируй итоговый план на основе контекста`

Ответ AI:
- Сформировал decision-complete implementation plan для `api:check`.

### Prompt 4

`делай план`

Ответ AI:
- Проверил, что текущая ветка `main`, и остановился до реализации, потому что workflow требует отдельную branch per work item.

### Prompt 5

`да, нужно создать ветку по соглашению в проекте`

Ответ AI:
- Прочитал workflow и journal entries.
- Создал ветку `4-openapi-contract-check`.
- Реализовал OpenAPI contract check и прогнал verification.

### Prompt 6

`задача сделана, сначала сделай journal и потом я сделаю повторное реью, зафиксируй это себе в процесс`

Ответ AI:
- Обновил эту journal entry до повторного review.
- Не стал архивировать задачу, коммитить или merge-ить до review.

### Prompt 7

`задача готова`

Ответ AI:
- Архивировал task, обновил roadmap и archive index.
- Подготовил финальный commit/merge по workflow.

## Мои решения

- Проверять обязательные endpoints как `METHOD path`, а не только path.
- Падать только при отсутствии обязательных operations; дополнительные endpoints разрешены.
- Использовать `yaml` как прямую devDependency пакета `@scheduling/api-contract`.
- Проверять ровно 19 MVP operations из `docs/requirements.md`.
- `api:check` читает уже сгенерированный `generated/openapi.yaml` и не запускает `api:generate`.
- Добавить package-level и root-level `api:check`.
- Success output: `OpenAPI contract check passed: 19 required operations checked.`
- Перед повторным review сначала обновлять journal; archive/commit/merge остаются после review.
- После повторного review задача считается готовой к archive/commit/merge.

## Что сделал AI

- Создал branch `4-openapi-contract-check`.
- Добавил `packages/api-contract/scripts/check-openapi.mjs`.
- Добавил `packages/api-contract/scripts/check-openapi.test.mjs`.
- Добавил root script `api:check`.
- Добавил package scripts `api:check` и `test:check-openapi`.
- Добавил прямую dependency `yaml` и обновил `pnpm-lock.yaml`.
- После review архивировал task `openapi-contract-check` и обновил roadmap/archive index.

## Верификация

- `node --test packages/api-contract/scripts/check-openapi.test.mjs`: сначала RED на отсутствующем `check-openapi.mjs`, затем 2/2 pass.
- `pnpm install`: lockfile/importer обновлен, dependencies установлены из cache.
- `pnpm api:generate`: TypeSpec успешно сгенерировал OpenAPI.
- `pnpm api:check`: успешно, проверено 19 required operations.
- `pnpm --filter @scheduling/api-contract run test:check-openapi`: 2/2 pass.
- `git diff --check`: whitespace ошибок нет.

## Результат

OpenAPI contract check реализован, проверен и после human review архивирован. Финальный commit subject: `feat(api-contract): add openapi contract check`.
