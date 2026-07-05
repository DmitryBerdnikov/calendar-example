# OpenAPI TypeScript API client

The generated API client uses `openapi-typescript` to generate runtime-free TypeScript types from the TypeSpec-generated OpenAPI document, and `openapi-fetch` to provide typed request helpers.

This keeps `@scheduling/api-client` small and React-friendly while preserving TypeSpec/OpenAPI as the HTTP contract source of truth. The package owns only the default local mock base URL and typed client factory; authentication headers remain owned by the caller so frontend storage and session policy are not hidden inside the generated client.

The main alternatives were a fuller generated SDK such as Hey API or OpenAPI Generator's `typescript-fetch`. Those would provide more generated operation functions, but they would also expose a larger generator-specific public API before the frontend patterns are established.
