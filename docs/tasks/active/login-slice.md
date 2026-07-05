# Login Slice

Status: active
Roadmap: Frontend
Depends on: web-app-scaffold.md

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
- Заполняется при архивировании.
