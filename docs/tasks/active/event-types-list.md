# Event Types List

Status: active
Roadmap: Frontend
Depends on: login-slice.md

## О чем

Реализовать страницу `/event-types` со списком event types и основными actions.

## Зачем

Это первая основная admin page продукта и база для create/edit/preview flows.

## Изменения

- Читать список из `GET /event-types`.
- Показывать title, slug, duration, active state.
- Добавить preview link, edit link, delete action, activate/deactivate action.
- Учитывать, что Prism mutations stateless и список не обязан изменяться после action.
- Добавить Playwright smoke для list page.

## Верификация

- Запустить Prism.
- Выполнить frontend typecheck.
- Выполнить Playwright smoke для event types list.
- Ожидаемо: список и actions отображаются и обрабатывают mocked success/error.

## Результат

Ожидаемый результат:
- Organizer видит и управляет mocked event types list.

Фактический результат:
- Заполняется при архивировании.
