.DEFAULT_GOAL := help

.PHONY: help install api-generate api-check api-client-generate api-mock docs-dev web-dev typecheck web-build web-e2e verify

help:
	@printf "Available targets:\n"
	@printf "  install              Install dependencies\n"
	@printf "  api-generate         Generate OpenAPI from TypeSpec\n"
	@printf "  api-check            Check generated OpenAPI\n"
	@printf "  api-client-generate  Generate OpenAPI and API client types\n"
	@printf "  api-mock             Run Prism mock server\n"
	@printf "  docs-dev             Run Swagger UI preview\n"
	@printf "  web-dev              Run web app dev server\n"
	@printf "  typecheck            Typecheck all packages\n"
	@printf "  web-build            Build web app\n"
	@printf "  web-e2e              Run web Playwright smoke tests\n"
	@printf "  verify               Run contract check, typecheck, and web build\n"

install:
	pnpm install

api-generate:
	pnpm api:generate

api-check:
	pnpm api:check

api-client-generate:
	pnpm api:client:generate

api-mock:
	pnpm api:mock

docs-dev:
	pnpm docs:dev

web-dev:
	pnpm web:dev

typecheck:
	pnpm typecheck

web-build:
	pnpm --filter @scheduling/web run build

web-e2e:
	pnpm --filter @scheduling/web test:e2e

verify: api-check typecheck web-build
