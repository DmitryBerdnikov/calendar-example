# Workspace Scaffold

Status: active
Roadmap: Contract
Depends on: none

## О чем

Создать pnpm workspace skeleton для contract, generated client, Swagger UI, web app и будущего API app.

## Зачем

Нужна базовая структура репозитория, чтобы следующие задачи могли добавлять TypeSpec, Swagger, Prism и фронтенд в понятные workspace-пакеты.

## Изменения

- Создать root workspace config: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.gitignore`.
- Создать package manifests для `packages/api-contract`, `packages/api-client`, `apps/docs`, `apps/web`.
- Создать `apps/api/.gitkeep`; backend пока не реализовывать.
- Добавить root scripts: `api:generate`, `api:mock`, `docs:dev`, `web:dev`, `typecheck`.
- Соблюдать project conventions: Conventional Commits для commit messages и `kebab-case` для имен файлов, если это позволяет язык или toolchain.

## Верификация

- Выполнить `pnpm install`.
- Выполнить `pnpm -r exec pwd`.
- Ожидаемо: pnpm видит все workspace-пакеты.

## Результат

Ожидаемый результат:
- В репозитории есть рабочий pnpm monorepo skeleton.

Фактический результат:
- Заполняется при архивировании.
