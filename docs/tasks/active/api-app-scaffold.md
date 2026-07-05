# API App Scaffold

## О чем

Создать минимальный `apps/api` Fastify app без бизнес-логики.

## Зачем

Нужна запускаемая backend оболочка, которая позже заменит Prism на том же локальном API address.

## Изменения

- Добавить package manifest, TypeScript config и scripts для `@scheduling/api`.
- Добавить Fastify server factory, entrypoint, CORS и config defaults.
- Слушать `127.0.0.1:4010` по умолчанию.
- Добавить простой health endpoint только для локальной smoke verification.

## Верификация

- Выполнить `pnpm install`.
- Выполнить `pnpm --filter @scheduling/api typecheck`.
- Запустить API и проверить health endpoint через `curl -i`.

## Результат

Ожидаемый результат:
- `apps/api` запускается как отдельный workspace package и готов принимать MVP routes в следующих задачах.
