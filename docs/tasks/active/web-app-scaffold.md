# Web App Scaffold

Status: active
Roadmap: Frontend
Depends on: generated-api-client.md

## О чем

Создать React frontend scaffold с Mantine, React Router и TanStack Query.

## Зачем

Нужна базовая оболочка приложения перед реализацией отдельных UI slices против Prism.

## Изменения

- Создать Vite React app в `apps/web`.
- Настроить Mantine provider, React Router и TanStack Query.
- Настроить API base URL из `VITE_API_BASE_URL` с default `http://localhost:4010`.
- Добавить protected admin routes и public `/book/:slug`.
- Дизайн держать максимально близко к Cal.com без копирования brand assets.

## Верификация

- Выполнить `pnpm --filter @scheduling/web typecheck`.
- Ожидаемо: app компилируется и показывает базовую оболочку.

## Результат

Ожидаемый результат:
- Есть frontend shell, готовый для feature slices.

Фактический результат:
- Заполняется при архивировании.
