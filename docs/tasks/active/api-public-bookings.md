# API Public Bookings

## О чем

Реализовать guest booking creation endpoint.

## Зачем

Guest должен создать real booking, а выбранный slot должен исчезнуть из будущих slot responses.

## Изменения

- Реализовать `POST /public/event-types/{slug}/bookings`.
- Принимать `startAt`, `guestName`, `guestEmail`.
- Вычислять `endAt` из event type duration.
- Разрешать booking только для active event type.
- Отклонять past start, unavailable start и conflicts.
- Создавать confirmed booking.

## Верификация

- Добавить API tests для successful booking, inactive event type, unavailable start, past start и double-booking conflict.
- Выполнить `pnpm --filter @scheduling/api test`.
- Проверить curl flow: slots -> booking -> same slot disappears.

## Результат

Ожидаемый результат:
- Guest public booking flow завершает real persisted booking.
