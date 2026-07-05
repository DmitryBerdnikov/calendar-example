# Public Booking Flow

Status: active
Roadmap: Frontend
Depends on: event-type-create-edit.md

## О чем

Реализовать admin preview и публичный booking flow на `/book/:slug`.

## Зачем

Главный сценарий Cal.com-style продукта: guest без login выбирает слот и создает booking.

## Изменения

- Реализовать `/event-types/:id/preview` как admin preview public booking page.
- Реализовать `/book/:slug`.
- Читать public event type через `GET /public/event-types/{slug}`.
- Читать slots через `GET /public/event-types/{slug}/slots`.
- Создавать booking через `POST /public/event-types/{slug}/bookings`.
- Добавить guest form с `guestName` и `guestEmail`.

## Верификация

- Запустить Prism.
- Выполнить frontend typecheck.
- Выполнить Playwright smoke для slot selection и booking submission.
- Ожидаемо: public booking flow завершается на mocked data.

## Результат

Ожидаемый результат:
- Guest может пройти mocked public booking flow без login.

Фактический результат:
- Заполняется при архивировании.
