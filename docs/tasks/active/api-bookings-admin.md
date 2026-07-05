# API Bookings Admin

## О чем

Реализовать authenticated booking list и cancellation endpoints.

## Зачем

Organizer должен видеть created bookings и отменять их без удаления records.

## Изменения

- Реализовать `GET /bookings`.
- Реализовать `POST /bookings/{id}/cancel`.
- Cancellation sets `status = cancelled` and `cancelledAt`.
- Cancelled bookings remain listed.
- Cancelling an already cancelled booking returns booking without creating a duplicate state.

## Верификация

- Добавить API tests для list, cancel confirmed booking, cancel already cancelled booking и not found.
- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить curl smoke для list/cancel flow.

## Результат

Ожидаемый результат:
- `/bookings` frontend slice может работать против persisted backend bookings.
