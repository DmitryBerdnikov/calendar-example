# Availability Slice


## О чем

Реализовать `/availability` для weekly availability rules.

## Зачем

Availability управляет генерацией будущих slots для всех event types.

## Изменения

- Читать availability через `GET /availability`.
- Добавить форму для `weekday`, `startTime`, `endTime`.
- Подключить create, edit и delete mutations.
- Добавить client validation: `startTime < endTime`, формат `HH:mm`.
- Добавить Playwright smoke для list и mutations.

## Верификация

- Запустить Prism.
- Выполнить frontend typecheck.
- Выполнить Playwright smoke для availability.
- Ожидаемо: weekly availability rules видны и редактируются в UI.

## Результат

Ожидаемый результат:
- Organizer может управлять mocked weekly availability.

Фактический результат:
- Organizer может открыть `/availability`, увидеть mocked weekly availability rules, создать новое правило, отредактировать существующее правило и удалить правило.
- UI валидирует локальное время в формате `HH:mm` и блокирует сохранение, если `startTime >= endTime`.
- После успешных create/edit/delete UI обновляет список локально, чтобы stateless Prism mock не скрывал результат mutation.
