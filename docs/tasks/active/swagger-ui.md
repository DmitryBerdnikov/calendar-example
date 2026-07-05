# Swagger UI


## О чем

Сделать `apps/docs` как Vite Swagger UI app для просмотра generated OpenAPI.

## Зачем

Swagger нужен как быстрая визуальная проверка API до фронтенда и backend.

## Изменения

- Создать Vite React app в `apps/docs`.
- Подключить Swagger UI.
- Читать generated OpenAPI из `packages/api-contract`.
- Добавить root script `docs:dev`.

## Верификация

- Выполнить `pnpm docs:dev`.
- Ожидаемо: Swagger UI открывается и показывает все MVP endpoint groups.

## Результат

Ожидаемый результат:
- API можно просмотреть через локальный Swagger UI.

Фактический результат:
- Заполняется при архивировании.
