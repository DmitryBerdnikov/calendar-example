# Prism Mock


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
- Выполнить `curl -i -H 'Authorization: Bearer dev-token' http://127.0.0.1:4010/event-types`.
- Ожидаемо: Prism возвращает example response для event types.

## Результат

Ожидаемый результат:
- Локальный Prism server отдает моковые ответы по MVP API.

Фактический результат:
- Root `api:mock` запускает Prism через `@scheduling/api-contract`.
- Prism читает `packages/api-contract/generated/openapi.yaml` и явно слушает `127.0.0.1:4010`.
- `packages/api-contract/README.md` документирует генерацию OpenAPI, запуск mock server, base URL `http://localhost:4010` и smoke check для защищенного `/event-types`.
- Smoke check вернул `200` и example JSON для event types.
