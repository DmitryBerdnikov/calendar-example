# Generated API Client


## О чем

Сгенерировать TypeScript client/types из OpenAPI для фронтенда.

## Зачем

Фронтенд должен использовать типы из HTTP-контракта, а не вручную поддерживаемые дубликаты.

## Изменения

- Настроить `packages/api-client`.
- Выбрать OpenAPI TypeScript generator, совместимый с React frontend.
- Добавить root script `api:client:generate`.
- Экспортировать generated types/request helpers из `packages/api-client/src/index.ts`.

## Верификация

- Выполнить `pnpm api:client:generate`.
- Выполнить `pnpm --filter @scheduling/api-client typecheck`.
- Ожидаемо: generated client собирается и доступен как `@scheduling/api-client`.

## Результат

Ожидаемый результат:
- Фронтенд может импортировать generated API client/types.

Фактический результат:
- Добавлен `@scheduling/api-client` с generated OpenAPI types через `openapi-typescript` и typed request helpers через `openapi-fetch`.
- Добавлен root script `api:client:generate`, который сначала обновляет TypeSpec-generated OpenAPI, затем генерирует client types.
- Публичный API пакета экспортирует `createApiClient`, `DEFAULT_API_BASE_URL`, typed client/types и DTO aliases.
- Контрактный термин `User` переименован в `Organizer`, включая `LoginResponse.organizer`.
