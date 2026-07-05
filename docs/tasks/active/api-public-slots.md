# API Public Slots

## О чем

Реализовать public event type lookup и slot generation.

## Зачем

Guest booking flow должен показывать реальные доступные slots вместо OpenAPI examples.

## Изменения

- Реализовать `GET /public/event-types/{slug}`.
- Реализовать `GET /public/event-types/{slug}/slots`.
- Генерировать slots из weekly availability в `Europe/Moscow`.
- Шаг генерации равен `durationMinutes`.
- Возвращать slot только если весь booking помещается в availability interval.
- Не возвращать past slots.
- Исключать slots, overlapping non-cancelled bookings.
- Для inactive event type slots endpoint остается доступным для admin preview.

## Верификация

- Добавить API tests для timezone conversion, full-containment rule, past slot filtering, inactive preview slots и booking overlap exclusion.
- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить curl smoke для public event type and slots.

## Результат

Ожидаемый результат:
- Public booking calendar получает реальные available slots из backend.
