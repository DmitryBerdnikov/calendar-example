# API Availability

## О чем

Реализовать authenticated availability rule management endpoints.

## Зачем

Availability управляет будущей генерацией slots для всех event types.

## Изменения

- Реализовать list, create, get, update и delete.
- Валидировать weekday и local `HH:mm` times.
- Требовать `startTime < endTime`.
- Отклонять overlapping rules for same weekday with `409 Conflict`.
- Разрешать adjacent intervals.

## Верификация

- Добавить API tests для CRUD, invalid times, overlap conflict и adjacent intervals.
- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить curl smoke для create/update/delete flow.

## Результат

Ожидаемый результат:
- `/availability` frontend slice может работать против persisted backend state.
