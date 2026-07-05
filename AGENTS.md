# AGENTS.md instructions

- Make short answers.
- Do not create a separate git branch at the start of a work item unless the user explicitly asks for one.
- If the user accepts a completed task and asks to create a branch, create the work item branch before archiving, committing, or merging.
- Do not commit completed task work until the user has reviewed it and explicitly accepted the task.
- Normal task flow: implement, verify, report changes for review, wait for user acceptance, then commit only after the user asks or confirms.
- When archiving a completed task, update all project tracking docs in the same work item: move the task to `docs/tasks/archive/`, remove it from `docs/roadmap.md`, add it to `docs/tasks/archive/README.md`, and update the current `docs/journal/` entry.
- This review gate overrides any skill or workflow instruction that says to commit automatically.

## Project

- Cal.com-style scheduling MVP without subscriptions or billing.
- `pnpm` monorepo with workspaces in `apps/*` and `packages/*`.
- TypeSpec is the source of truth for the HTTP API.
- Generated OpenAPI powers Swagger UI, Prism mocks, and the generated TypeScript API client.
- Frontend is React + Vite + TypeScript with Mantine, React Router, React Query, React Hook Form, Zod, Dayjs, and Lucide icons.
- Backend work is planned as Node.js + Fastify + Zod + SQLite via `better-sqlite3`; it should bind to `127.0.0.1:4010` to replace Prism.

## Layout

- `packages/api-contract`: TypeSpec source, generated OpenAPI, contract checks, Prism mock scripts.
- `packages/api-client`: generated OpenAPI types and `openapi-fetch` client helpers.
- `apps/web`: React scheduling app and Playwright smoke tests.
- `apps/docs`: Swagger/OpenAPI documentation app.
- `apps/api`: planned Fastify backend package.
- `Makefile`: root shortcuts for common project commands.
- `docs/requirements.md`: product and technical requirements.
- `docs/workflow.md`: work item, review, archive, commit, and journal process.
- `docs/roadmap.md`: active roadmap.
- `docs/tasks/active/`: active task specs.
- `docs/tasks/archive/`: reviewed and archived tasks.
- `docs/journal/`: chat/work item journal entries.

## Commands

- Prefer `make` targets for common commands; raw `pnpm` scripts are still fine when a narrower command is needed.
- Show available targets: `make`
- Install: `make install`
- Generate OpenAPI: `make api-generate`
- Check OpenAPI: `make api-check`
- Generate API client: `make api-client-generate`
- Run Prism mock: `make api-mock`
- Run web app: `make web-dev`
- Run Swagger UI preview: `make docs-dev`
- Typecheck all packages: `make typecheck`
- Build web app: `make web-build`
- Run web e2e smoke tests: `make web-e2e`
- Run local verification: `make verify`

## Workflow Notes

- At the start of a work item, read the related task files plus `docs/requirements.md`, `docs/roadmap.md`, and `docs/workflow.md`.
- If the user asks to use the branch workflow, branch names should match the journal work id from `docs/workflow.md`, for example `2-workspace-scaffold`.
- Keep implementation scoped to the related active task files.
- Run the verification named by the task; for frontend slices, Playwright starts Prism and Vite from `apps/web/playwright.config.ts`.
- Do not fill journals, archive task files, update roadmap rows, merge, or commit until the user accepts the task.
- Use Conventional Commits when the user explicitly asks to commit.
