# pnpm monorepo layout

The project uses a pnpm monorepo with separate packages for the API contract and generated API client, plus separate apps for Swagger UI, the frontend, and the backend. This keeps generated artifacts and runtime applications isolated while letting each implementation step be verified independently.
