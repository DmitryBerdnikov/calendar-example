# API Auth

## О чем

Реализовать organizer login и current organizer lookup.

## Зачем

Admin routes уже ожидают Bearer token flow через `POST /auth/login` и `GET /auth/me`.

## Изменения

- Реализовать `POST /auth/login` по текущему OpenAPI contract.
- Реализовать `GET /auth/me` с Bearer token проверкой.
- Возвращать `401` для неверных credentials, отсутствующего token и stale token.
- Использовать seeded organizer credentials из requirements.

## Верификация

- Добавить API tests для successful login, invalid login, valid token lookup и stale token cleanup behavior.
- Выполнить `pnpm --filter @scheduling/api test`.
- Выполнить login smoke через `curl -i`.

## Результат

Ожидаемый результат:
- Frontend login flow может работать против `apps/api` без Prism.
