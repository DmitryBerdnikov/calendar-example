# TypeSpec Contract


## О чем

Описать полный MVP HTTP API в TypeSpec и настроить генерацию OpenAPI.

## Зачем

TypeSpec является источником правды для Swagger, Prism, generated client и будущего backend. Фронтенд не должен начинаться до согласованного API-контракта.

## Изменения

- Создать TypeSpec файлы в `packages/api-contract/tsp`.
- Описать модели auth, event types, availability, bookings, public booking, errors и examples.
- Описать все MVP endpoints из `docs/requirements.md`.
- Добавить examples, достаточные для Prism mock responses.
- Настроить `packages/api-contract/tspconfig.yaml`.

## Верификация

- Выполнить `pnpm api:generate`.
- Ожидаемо: появляется generated OpenAPI со всеми MVP paths и examples.

## Результат

Ожидаемый результат:
- Полный MVP API описан в TypeSpec и генерирует OpenAPI.

Фактический результат:
- Заполняется при архивировании.
