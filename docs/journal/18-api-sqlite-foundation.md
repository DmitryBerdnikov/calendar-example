# Chat 18: API SQLite Foundation

Work id: `18-api-sqlite-foundation`
Date: 2026-07-05
Related branch: current workspace
Related tasks:
- `docs/tasks/archive/2026-07-05-api-sqlite-foundation.md`

## Контекст

В этом чате нужно было реализовать backend persistence foundation для будущих API endpoint tasks.

## Мои промпты

### Prompt 1

`делаем задачи [api-sqlite-foundation.md](docs/tasks/active/api-sqlite-foundation.md) [$grill-me](/Users/berdnikov/web/learning/ai-workshop/project-v2/.agents/skills/grill-me/SKILL.md)`

Ответ AI:
- Провел grill-me session, прочитал task, requirements, workflow, roadmap, ADR, текущий `apps/api` scaffold и следующие backend задачи.
- Сформировал план SQLite foundation.

### Prompt 2

`да реализуй этот план`

Ответ AI:
- Реализовал SQLite config, migrations, seed, test database factory и verification tests.
- Не создавал ветку и не коммитил до review.

### Prompt 3

`задача готова`

Ответ AI:
- Архивировал task, обновил roadmap/archive README/journal и подготовил финальный commit.

## Мои решения

- Scope: только SQLite foundation, без реализации auth/event/availability/bookings endpoints.
- Default database path: `apps/api/data/dev.sqlite`.
- Migrations хранить как `.sql` files.
- Seed organizer credentials хранить как password hash + salt.
- Seed создает organizer, один event type и Mon-Fri `09:00-17:00` availability без bookings.
- DB API на этом шаге остается infrastructure-only.
- `start/dev` не запускают DB setup автоматически; добавлена отдельная команда `db:setup`.
- Test database factory использует in-memory SQLite.
- Schema использует strong constraints, а бизнес-правила conflicts остаются будущим services.

## Что сделал AI

- Добавил `better-sqlite3`, `@types/better-sqlite3` и build allowlist.
- Добавил `API_DATABASE_PATH` в API config.
- Добавил `apps/api/src/db`: connection helper, SQL migration runner, seed, `db:setup`, in-memory test DB factory и tests.
- Добавил migrations для `organizers`, `sessions`, `event_types`, `availability_rules`, `bookings` и tightened constraints.
- Добавил ignore rules для local SQLite files.

## Верификация

- `pnpm --filter @scheduling/api test`: 3 files, 9 tests passed.
- `pnpm --filter @scheduling/api typecheck`: passed.
- `git diff --check`: clean.
- `db:setup` был проверен до tightened migration; повторный escalated запуск после migration 002 был заблокирован лимитом approvals, но migration/seed repeatability покрыты in-memory tests.

## Результат

API SQLite Foundation готов и архивирован. Backend получил повторяемую SQLite schema и seed state для следующих endpoint tasks.
