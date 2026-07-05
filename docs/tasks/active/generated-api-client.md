# Generated API Client

Status: active
Roadmap: Contract
Depends on: typespec-contract.md

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
- Заполняется при архивировании.
