# Backend E2E Cutover

## О чем

Добавить frontend smoke verification против real backend.

## Зачем

Нужно доказать, что backend может заменить Prism для всего mocked MVP flow.

## Изменения

- Добавить backend-backed Playwright mode or config.
- Сохранить Prism smoke suite до окончательного решения о cutover.
- Проверить persisted flows: login, event types, availability, public booking, slot removal and admin cancellation.
- Документировать local backend run command.

## Верификация

- Выполнить `pnpm api:generate`.
- Выполнить `pnpm api:check`.
- Выполнить `pnpm api:client:generate`.
- Выполнить `pnpm typecheck`.
- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить backend-backed Playwright smoke suite.

## Результат

Ожидаемый результат:
- Full MVP frontend flow проходит против `apps/api`, а Prism остается доступен как contract mock.
