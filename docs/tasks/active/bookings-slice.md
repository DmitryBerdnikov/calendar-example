# Bookings Slice


## О чем

Реализовать `/bookings` со списком bookings и cancel action.

## Зачем

Organizer должен видеть созданные bookings и отменять их без удаления записи.

## Изменения

- Читать список через `GET /bookings`.
- Показывать event type title, guest name/email, start/end, status.
- Подключить `POST /bookings/{id}/cancel`.
- Отключать cancel для already cancelled bookings.
- Добавить Playwright smoke для list и cancel.

## Верификация

- Запустить Prism.
- Выполнить frontend typecheck.
- Выполнить Playwright smoke для bookings.
- Ожидаемо: organizer видит mocked bookings и может вызвать cancel action.

## Результат

Ожидаемый результат:
- Organizer может просматривать и отменять mocked bookings.

Фактический результат:
- Заполняется при архивировании.
