# Chat 7: Prism Mock

Work id: `7-prism-mock`
Date: 2026-07-05
Related branch: `7-prism-mock`
Related tasks:
- `docs/tasks/archive/2026-07-05-prism-mock.md`

## Контекст

В этом чате нужно было закрыть активную задачу Prism mock: закрепить уже существующий mock server поверх generated OpenAPI, явно зафиксировать адрес запуска и документировать usage для следующих frontend slices.

## Мои промпты

### Prompt 1

`делаем задачу [prism-mock.md](docs/tasks/active/prism-mock.md), сначала [$grill-me](/Users/berdnikov/web/learning/ai-workshop/project-v2/.agents/skills/grill-me/SKILL.md)`

Ответ AI:
- Прочитал `grill-me`, `grilling`, task, package scripts и текущий OpenAPI context.
- Выявил, что Prism dependency и scripts уже были добавлены раньше, а missing part — явный setup, README и verification.

### Prompt 2

`делай план`

Ответ AI:
- Сформировал implementation plan: ветка `7-prism-mock`, явный bind `127.0.0.1:4010`, README и smoke check с Bearer token.

### Prompt 3

`PLEASE IMPLEMENT THIS PLAN: ...`

Ответ AI:
- Создал ветку `7-prism-mock`.
- Обновил Prism script, добавил README и проверил mock server.
- Не коммитил и не архивировал до human review.

### Prompt 4

`задача готова`

Ответ AI:
- Архивировал task, обновил roadmap, archive index и journal.
- Подготовил финальный commit и merge в `main`.

## Мои решения

- Не менять auth semantics OpenAPI: `GET /event-types` остается admin route с Bearer token.
- Закрепить текущий Prism setup вместо переизобретения mock layer.
- Документировать client base URL как `http://localhost:4010`, а server bind как `127.0.0.1:4010`.

## Что сделал AI

- Создал branch `7-prism-mock`.
- Сделал `api:mock` в `@scheduling/api-contract` явным: `prism mock generated/openapi.yaml --host 127.0.0.1 --port 4010`.
- Добавил `packages/api-contract/README.md` с командами генерации, запуска mock server и smoke curl.
- Архивировал `prism-mock` task после human acceptance.

## Верификация

- `pnpm api:generate`: TypeSpec успешно сгенерировал OpenAPI.
- `pnpm --filter @scheduling/api-contract run api:mock`: Prism стартовал на `http://127.0.0.1:4010`.
- `curl -i -H 'Authorization: Bearer dev-token' http://127.0.0.1:4010/event-types`: вернул `200` и event type example JSON.
- `git diff --check`: whitespace ошибок нет.

## Результат

Prism mock закреплен как документированный local mock server для MVP API. Задача архивирована, удалена из roadmap и добавлена в archive index. Финальный commit закрывает work item `7-prism-mock`.
