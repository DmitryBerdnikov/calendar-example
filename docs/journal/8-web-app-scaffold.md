# Chat 8: Web App Scaffold

Work id: `8-web-app-scaffold`
Date: 2026-07-05
Related branch: `8-web-app-scaffold`
Related tasks:
- `docs/tasks/archive/2026-07-05-web-app-scaffold.md`

## Контекст

В этом чате нужно было создать базовый React frontend scaffold для будущих UI slices против Prism mock.

## Мои промпты

### Prompt 1

`делаем задачу [web-app-scaffold.md](docs/tasks/active/web-app-scaffold.md), сначала [$grill-with-docs](/Users/berdnikov/web/learning/ai-workshop/project-v2/.agents/skills/grill-with-docs/SKILL.md)`

Ответ AI:
- Провел grilling session, прочитал task, requirements, workflow, glossary и текущую структуру workspace.
- Сформировал итоговый план без записи doc-файла в проект.

### Prompt 2

`PLEASE IMPLEMENT THIS PLAN: ...`

Ответ AI:
- Создал branch `8-web-app-scaffold`.

### Prompt 3

`делаем план`

Ответ AI:
- Временно записал superpowers plan, но позже он был удален по human instruction.

### Prompt 4

`я удалил план в проекте, его не надо записывать, он есть в текущем контексте для задачи [web-app-scaffold.md](docs/tasks/active/web-app-scaffold.md). Делаем задачу по итоговому плану`

Ответ AI:
- Реализовал scaffold в `apps/web`.
- Запустил проверки и dev server для ручного просмотра.

### Prompt 5

`перенеси [page-shell.tsx](apps/web/src/pages/page-shell.tsx), в pages должны быть только страницы, конкретные роуты`

Ответ AI:
- Перенес shared `PageShell` в `apps/web/src/shared/ui/page-shell.tsx`.
- Подтвердил `typecheck`.

### Prompt 6

`задача готова`

Ответ AI:
- Архивировал task, обновил roadmap, archive index и journal.
- Подготовил финальный commit и merge в `main`.

## Мои решения

- Admin остается UI label only; доменный термин в glossary остается `Organizer`.
- Scaffold не делает Prism API calls; future feature slices добавят queries.
- Protected admin routes уже редиректят unauthenticated users на `/login`.
- Session token хранится в `localStorage` под ключом `scheduling.sessionToken`.
- `pages` содержит только route components; shared UI вынесен в `shared/ui`.

## Что сделал AI

- Создал Vite React TypeScript app в `apps/web`.
- Добавил Mantine provider, TanStack Query provider и React Router.
- Настроил API base URL через `VITE_API_BASE_URL` с fallback `http://localhost:4010`.
- Добавил protected admin shell, public booking route и placeholders для всех запланированных routes.
- Обновил pnpm lockfile и разрешил `esbuild` build script через `pnpm-workspace.yaml`.

## Верификация

- `pnpm --filter @scheduling/web typecheck`: TypeScript проверка прошла.
- `pnpm --filter @scheduling/web build`: production build прошел.
- `git diff --check`: whitespace ошибок нет.

## Результат

Frontend shell готов для следующих feature slices. Задача архивирована, удалена из roadmap и добавлена в archive index. Финальный commit закрывает work item `8-web-app-scaffold`.
