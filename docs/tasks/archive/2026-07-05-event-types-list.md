# Event Types List


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
- Organizer видит mocked event types list на `/event-types`.
- Список читает Event Types через generated typed `apiClient` на основе OpenAPI contract.
- Страница показывает title, slug, duration и active state.
- Доступны preview link, edit link, delete с confirm modal, activate/deactivate actions.
- После mutation UI показывает success/error feedback и перечитывает server truth, не подделывая state Prism.
- Добавлен Playwright smoke для list page, action success, inactive activate state и mocked mutation error.
