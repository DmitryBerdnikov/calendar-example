# Prism Mock

Status: active
Roadmap: Mocking
Depends on: typespec-contract.md

## О чем

Настроить Prism mock server поверх generated OpenAPI.

## Зачем

Фронтенд должен работать на моках до реализации backend. Prism дает stateless ответы из OpenAPI examples.

## Изменения

- Добавить root script `api:mock`.
- Использовать `packages/api-contract/generated/openapi.yaml`.
- Зафиксировать mock base URL `http://localhost:4010`.
- Документировать запуск в `packages/api-contract/README.md`.

## Верификация

- Выполнить `pnpm api:generate`.
- Запустить `pnpm api:mock`.
- Выполнить `curl http://localhost:4010/event-types`.
- Ожидаемо: Prism возвращает example response для event types.

## Результат

Ожидаемый результат:
- Локальный Prism server отдает моковые ответы по MVP API.

Фактический результат:
- Заполняется при архивировании.
