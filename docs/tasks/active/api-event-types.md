# API Event Types

## О чем

Реализовать authenticated event type management endpoints.

## Зачем

Organizer должен управлять public booking options через real persisted backend.

## Изменения

- Реализовать list, create, get, update, delete, activate и deactivate.
- Проверять slug format и uniqueness.
- Возвращать `409 Conflict` при duplicate slug.
- Отклонять delete event type с existing bookings.

## Верификация

- Добавить API tests для CRUD, activation, duplicate slug и delete conflict.
- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить curl smoke для list/create/update/action flow.

## Результат

Ожидаемый результат:
- `/event-types` frontend slice может работать против persisted backend state.
