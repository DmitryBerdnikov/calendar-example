# Final Mocked MVP Verification


## О чем

Провести финальную проверку mocked MVP перед backend implementation.

## Зачем

Нужно доказать, что TypeSpec, OpenAPI, Swagger, Prism, generated client и frontend работают вместе до начала backend.

## Изменения

- Исправлять только дефекты, найденные во время проверки.
- Backend implementation не начинать в этой задаче.

## Верификация

- Выполнить `pnpm api:generate`.
- Выполнить `pnpm api:check`.
- Выполнить `pnpm api:client:generate`.
- Выполнить `pnpm typecheck`.
- Запустить `pnpm api:mock`.
- Выполнить Playwright smoke suite.
- Запустить `pnpm docs:dev` и проверить Swagger endpoint groups.
- Запустить `pnpm web:dev` и проверить required routes.

## Результат

Ожидаемый результат:
- Frontend работает против Prism, Swagger показывает контракт, backend остается deferred.

Фактический результат:
- Заполняется при архивировании.
