# Chat 9: Login Slice

Work id: `9-login-slice`
Date: 2026-07-05
Related branch: `9-login-slice`
Related tasks:
- `docs/tasks/archive/2026-07-05-login-slice.md`

## Контекст

В этом чате нужно было реализовать mocked Organizer login flow для frontend против Prism.

## Мои промпты

### Prompt 1

`Делаем задачу [login-slice.md](docs/tasks/active/login-slice.md) [$grill-with-docs](/Users/berdnikov/web/learning/ai-workshop/project-v2/.agents/skills/grill-with-docs/SKILL.md)`

Ответ AI:
- Провел grill-with-docs session, прочитал task, requirements, workflow, glossary, ADR и frontend scaffold.
- Сформировал план login slice.

### Prompt 2

`реализуй план`

Ответ AI:
- Создал branch `9-login-slice`.

### Prompt 3

`делай задачу по плану`

Ответ AI:
- Реализовал login flow, session guard, sign out и Playwright smoke.
- Запустил verification.

### Prompt 4

`на данном этапе авторизации нет? Я не могу ввести логин и пароль и войти или могу? Если могу пришли креды`

Ответ AI:
- Объяснил, что login работает как mocked Prism flow, и передал credentials из OpenAPI example.

### Prompt 5

`задача готова`

Ответ AI:
- Повторно запустил verification, архивировал task, обновил roadmap, archive index и journal.

## Мои решения

- `/auth/me` используется как проверка допуска для authenticated shell.
- После login возвращать Organizer на исходный protected route или на `/event-types`.
- Auth orchestration держать в shared session module.
- Добавить видимый local sign out.
- Не показывать mock credentials на login page.
- Playwright `test:e2e` сам стартует Prism и Vite.

## Что сделал AI

- Добавил React Hook Form, Zod, hookform resolver и Playwright.
- Реализовал Mantine login form с validation и `POST /auth/login`.
- Сохраняет Bearer token в `localStorage` под `scheduling.sessionToken`.
- Protected routes проверяют token через `GET /auth/me`, очищают stale token на `401` и редиректят на `/login`.
- Admin shell показывает Organizer name и local sign out.
- Добавил Playwright smoke для login flow.

## Верификация

- `pnpm --filter @scheduling/web typecheck`: TypeScript проверка прошла.
- `pnpm --filter @scheduling/web test:e2e`: 5 Playwright tests прошли против Prism/Vite.

## Результат

Login slice готов и архивирован. Organizer может пройти mocked login flow с Prism credentials и попасть в admin routes.
