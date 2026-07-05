# API Contract

This package owns the TypeSpec source and generated OpenAPI contract for the scheduling MVP.

## Generate OpenAPI

```sh
pnpm api:generate
```

The generated contract is written to:

```text
packages/api-contract/generated/openapi.yaml
```

## Run Prism Mock

```sh
pnpm api:mock
```

The mock server reads `packages/api-contract/generated/openapi.yaml` and binds to `127.0.0.1:4010`.
Frontend clients should use this base URL:

```text
http://localhost:4010
```

Prism is stateless and returns responses from the OpenAPI examples. Protected admin routes still require a Bearer token shape in requests. For example:

```sh
curl -i -H 'Authorization: Bearer dev-token' http://127.0.0.1:4010/event-types
```
