# OpenAPI Contract Check


## О чем

Добавить проверку, что generated OpenAPI содержит обязательные MVP endpoints.

## Зачем

Нужен быстрый guardrail против случайного удаления endpoint-ов из TypeSpec при следующих изменениях.

## Изменения

- Создать `packages/api-contract/scripts/check-openapi.mjs`.
- Проверять наличие paths: auth, event types, public booking, availability и bookings.
- Добавить root script `api:check`.

## Верификация

- Выполнить `pnpm api:generate`.
- Выполнить `pnpm api:check`.
- Ожидаемо: команда завершается успешно и печатает количество проверенных paths.

## Результат

Ожидаемый результат:
- Контракт можно автоматически проверить на наличие обязательных routes.

Фактический результат:
- Добавлен `api:check`, который проверяет 19 обязательных MVP operations в generated OpenAPI.
- Проверка читает `packages/api-contract/generated/openapi.yaml`, падает при отсутствующих `METHOD path` и допускает дополнительные endpoints.
- Добавлены unit-тесты для обнаружения отсутствующих operations.
