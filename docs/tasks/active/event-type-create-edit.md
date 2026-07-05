# Event Type Create And Edit

Status: active
Roadmap: Frontend
Depends on: event-types-list.md

## О чем

Реализовать формы создания и редактирования event type.

## Зачем

Organizer должен управлять booking options, которые потом видны в preview и public booking flow.

## Изменения

- Создать общий Event Type form.
- Поля формы: `title`, `slug`, `description`, `durationMinutes`, `isActive`.
- Подключить `POST /event-types`.
- Подключить `GET /event-types/{id}` и `PATCH /event-types/{id}`.
- Добавить Playwright smoke для create/edit flows.

## Верификация

- Запустить Prism.
- Выполнить frontend typecheck.
- Выполнить Playwright smoke для create/edit.
- Ожидаемо: формы submit-ятся и показывают success/error states.

## Результат

Ожидаемый результат:
- Organizer может создать и отредактировать mocked event type.

Фактический результат:
- Заполняется при архивировании.
