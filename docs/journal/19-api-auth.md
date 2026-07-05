# Chat 19: API Auth

Work id: `19-api-auth`
Date: 2026-07-05
Related branch: `19-api-auth`
Related tasks:
- `docs/tasks/archive/2026-07-05-api-auth.md`

## Контекст

В этом чате нужно было реализовать backend auth endpoints, чтобы frontend login flow мог работать против `apps/api` без Prism.

## Мои промпты

### Prompt 1

`Делаем задачу [api-auth.md](docs/tasks/active/api-auth.md) [$grill-with-docs](/Users/berdnikov/.agents/skills/grill-with-docs/SKILL.md)`

Ответ AI:
- Провел grill-with-docs session, прочитал task, requirements, workflow, glossary, ADR, контракт, frontend auth flow и текущий `apps/api`.
- Сформировал план API Auth.

### Prompt 2

`делай задачу по плану`

Ответ AI:
- Реализовал API Auth по плану без ветки и без коммита.
- Проверил API tests, typecheck, db setup и curl smoke.

### Prompt 3

`задача сделана, ветку создавай, в agents.md поправь это правлио`

Ответ AI:
- Создал branch `19-api-auth`.
- Архивировал task, обновил roadmap/archive index/journal и уточнил branch rule в `AGENTS.md`.

## Мои решения

- Session token живет 24 часа от login.
- Stale sessions чистятся lazy при auth lookup.
- `Organizer Session` добавлен в glossary как доменный термин.
- ADR для session TTL/cleanup не нужен.
- Ветку создавать после acceptance, если пользователь явно просит.

## Что сделал AI

- Добавил `apps/api/src/auth.ts` с auth service, PBKDF2 password verification, opaque bearer token generation, 24h sessions и lazy stale cleanup.
- Подключил `POST /auth/login` и `GET /auth/me` в Fastify server factory.
- Добавил dependency injection для DB, time и token generator в API tests.
- Добавил API tests для login, invalid credentials, valid token lookup, missing/malformed token и stale token cleanup.
- Добавил `Organizer Session` в `CONTEXT.md`.
- Уточнил branch rule в `AGENTS.md`.

## Верификация

- `pnpm --filter @scheduling/api test`: 15 tests passed.
- `pnpm --filter @scheduling/api typecheck`: passed.
- `pnpm --filter @scheduling/api db:setup`: passed with sandbox escalation after `tsx` IPC was blocked in sandbox.
- Curl smoke на `127.0.0.1:4011`, потому что `4010` был занят: login returned `200`; `/auth/me` with returned bearer token returned `200`.
- `git diff --check`: clean.

## Результат

API Auth готов и архивирован. `apps/api` теперь поддерживает organizer login и current organizer lookup по Bearer token для frontend login flow.
