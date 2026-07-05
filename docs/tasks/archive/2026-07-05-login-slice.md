# Login Slice


## О чем

Реализовать `/login` и базовое authenticated состояние frontend.

## Зачем

Organizer admin routes должны быть защищены Bearer token, даже пока backend заменен Prism.

## Изменения

- Создать login page с Mantine, React Hook Form и Zod validation.
- Подключить `POST /auth/login`.
- Сохранять Bearer token после успешного login.
- Добавить `GET /auth/me` query для authenticated shell.
- Добавить Playwright smoke для login flow.

## Верификация

- Запустить Prism.
- Выполнить `pnpm --filter @scheduling/web typecheck`.
- Выполнить `pnpm --filter @scheduling/web test:e2e`.
- Ожидаемо: login form отправляется в Prism и ведет на `/event-types`.

## Результат

Ожидаемый результат:
- Organizer может пройти mocked login flow.

Фактический результат:
- Organizer может пройти mocked login flow через `/login` с Prism credentials, получить mock Bearer token, пройти `/auth/me` проверку и попасть на `/event-types`.
- Protected admin routes проверяют сохраненный token через `GET /auth/me`, очищают stale token на `401` и возвращают на `/login`.
- Playwright smoke покрывает validation, default redirect, protected return-to redirect, stale token cleanup и local sign out.
