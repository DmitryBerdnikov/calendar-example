# Swagger UI


## О чем

Сделать отдельную команду для локального Swagger UI preview generated OpenAPI.

## Зачем

Swagger нужен как быстрая визуальная проверка API до фронтенда и backend.

## Изменения

- Добавить root script `docs:dev`.
- Поднять локальный Swagger UI без Vite/React app.
- Читать generated OpenAPI из `packages/api-contract/generated/openapi.yaml`.
- Открывать preview в браузере при запуске команды.

## Верификация

- Выполнить `pnpm docs:dev`.
- Ожидаемо: Swagger UI открывается и показывает все MVP endpoint groups.

## Результат

Ожидаемый результат:
- API можно просмотреть через локальный Swagger UI.

Фактический результат:
- Добавлен root script `docs:dev`, который запускает локальный Swagger UI preview.
- Preview отдает `packages/api-contract/generated/openapi.yaml` как `/openapi.yaml`.
- UI использует `swagger-ui-dist` без Vite/React app.
