# Event Type Create And Edit


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

Фактически выполнено:
- `pnpm --filter @scheduling/web typecheck`: прошел.
- `pnpm --filter @scheduling/web test:e2e`: 12 тестов прошли против Prism/Vite.
- `git diff --check`: whitespace ошибок нет.

## Результат

Ожидаемый результат:
- Organizer может создать и отредактировать mocked event type.

Фактический результат:
- Organizer может открыть `/event-types/new`, заполнить общую Event Type form и отправить `POST /event-types`.
- Organizer может открыть `/event-types/:id/edit`, загрузить mocked event type через `GET /event-types/{id}` и сохранить полный snapshot через `PATCH /event-types/{id}`.
- Create/edit success возвращает Organizer на `/event-types` и показывает success state.
- Form validation и server error states покрыты Playwright smoke.
