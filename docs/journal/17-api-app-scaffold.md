# Chat 17: API App Scaffold

Work id: `17-api-app-scaffold`
Date: 2026-07-05
Related branch: `17-api-app-scaffold`
Related tasks:
- `docs/tasks/archive/2026-07-05-api-app-scaffold.md`

## Контекст

После backend planning нужно было создать минимальную запускаемую Fastify оболочку для будущего backend вместо Prism.

## Мои промпты

### Prompt 1

`делаем задачу [api-app-scaffold.md](docs/tasks/active/api-app-scaffold.md) [$grill-with-docs](/Users/berdnikov/web/learning/ai-workshop/project-v2/.agents/skills/grill-with-docs/SKILL.md)`

Ответ AI:
- Прочитал task, requirements, workflow, roadmap, ADR, glossary и текущую workspace structure.
- Провел grill-with-docs session и сформировал план без изменения файлов.

### Prompt 2

`сделай по плану`

Ответ AI:
- Реализовал `@scheduling/api` scaffold без ветки и без коммита.
- Проверил package tests, typecheck, workspace typecheck и health smoke.

### Prompt 3

`задача готова, сделай по соглашению в проекте в отдельной ветке`

Ответ AI:
- Переключился на work item branch `17-api-app-scaffold`.
- Архивировал задачу, обновил roadmap, archive index и journal.

## Мои решения

- Health endpoint: `GET /health` с `{ "status": "ok" }`.
- Основной запуск пока package-level: `pnpm --filter @scheduling/api start`.
- Config defaults через env: `API_HOST`, `API_PORT`, `API_CORS_ORIGINS`.
- CORS default разрешает `http://127.0.0.1:5173` и `http://localhost:5173`.
- Test harness для API scaffold: Vitest.
- Runtime strategy: direct TypeScript через `tsx`.
- После acceptance оформить работу в отдельной ветке.

## Что сделал AI

- Добавил `apps/api/package.json` и `apps/api/tsconfig.json`.
- Добавил Fastify config, server factory, entrypoint и `GET /health`.
- Добавил Vitest tests для config defaults, health endpoint и local CORS.
- Обновил `pnpm-lock.yaml`.
- Удалил `apps/api/.gitkeep`.
- Перенес task в archive и удалил его из roadmap.

## Верификация

- `pnpm install`: успешно.
- `pnpm --filter @scheduling/api test`: 3 tests passed.
- `pnpm --filter @scheduling/api typecheck`: успешно.
- `pnpm typecheck`: успешно.
- `curl -i http://127.0.0.1:4011/health`: `200 {"status":"ok"}`; порт `4010` был занят Prism.
- `git diff --check`: успешно.

## Результат

`apps/api` запускается как отдельный workspace package и готов принимать MVP routes в следующих backend tasks. Задача `API App Scaffold` архивирована.
