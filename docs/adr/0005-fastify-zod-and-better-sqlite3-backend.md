# Fastify, Zod, and better-sqlite3 backend

The backend uses Node.js with Fastify for HTTP routing, Zod for request validation, and SQLite via `better-sqlite3` for persistence. This keeps the MVP stack small and synchronous database access straightforward while still matching the TypeSpec-generated HTTP contract.
