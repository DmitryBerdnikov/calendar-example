# API SQLite Foundation

## О чем

Добавить SQLite persistence foundation для backend.

## Зачем

Реальный backend должен хранить organizer, sessions, event types, availability и bookings между HTTP requests.

## Изменения

- Добавить `better-sqlite3` connection и database path config.
- Добавить migrations для organizers, sessions, event types, availability rules и bookings.
- Добавить seed для одного organizer и начальных demo данных.
- Добавить test database factory для будущих API tests.

## Верификация

- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить `pnpm --filter @scheduling/api typecheck`.
- Проверить, что seed можно применить повторно без дублей.

## Результат

Ожидаемый результат:
- Backend имеет повторяемую SQLite schema и seed state для дальнейших endpoint tasks.

Фактический результат:
- Добавлен SQLite foundation для `apps/api`: database path config, `better-sqlite3` connection, SQL migrations, idempotent seed и in-memory test database factory.
- Seed создает одного organizer, active `intro-call` event type и weekday availability без bookings.
- `db:setup` запускает migrations и seed для локальной dev database.
- Повторяемость migrations и seed покрыта API tests.
