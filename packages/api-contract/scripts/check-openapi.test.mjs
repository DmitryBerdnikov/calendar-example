import assert from "node:assert/strict";
import test from "node:test";

import { findMissingOperations } from "./check-openapi.mjs";

test("findMissingOperations returns no missing operations when all required operations exist", () => {
  const openapi = {
    paths: {
      "/auth/login": { post: {} },
      "/auth/me": { get: {} },
    },
  };

  const missing = findMissingOperations(openapi, [
    { method: "POST", path: "/auth/login" },
    { method: "GET", path: "/auth/me" },
  ]);

  assert.deepEqual(missing, []);
});

test("findMissingOperations reports missing method and path pairs", () => {
  const openapi = {
    paths: {
      "/auth/login": { get: {} },
    },
  };

  const missing = findMissingOperations(openapi, [
    { method: "POST", path: "/auth/login" },
    { method: "GET", path: "/auth/me" },
  ]);

  assert.deepEqual(missing, ["POST /auth/login", "GET /auth/me"]);
});
