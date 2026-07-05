import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { parse } from "yaml";

export const requiredOperations = [
  { method: "POST", path: "/auth/login" },
  { method: "GET", path: "/auth/me" },
  { method: "GET", path: "/event-types" },
  { method: "POST", path: "/event-types" },
  { method: "GET", path: "/event-types/{id}" },
  { method: "PATCH", path: "/event-types/{id}" },
  { method: "DELETE", path: "/event-types/{id}" },
  { method: "POST", path: "/event-types/{id}/activate" },
  { method: "POST", path: "/event-types/{id}/deactivate" },
  { method: "GET", path: "/public/event-types/{slug}" },
  { method: "GET", path: "/public/event-types/{slug}/slots" },
  { method: "POST", path: "/public/event-types/{slug}/bookings" },
  { method: "GET", path: "/availability" },
  { method: "POST", path: "/availability" },
  { method: "GET", path: "/availability/{id}" },
  { method: "PATCH", path: "/availability/{id}" },
  { method: "DELETE", path: "/availability/{id}" },
  { method: "GET", path: "/bookings" },
  { method: "POST", path: "/bookings/{id}/cancel" },
];

export function findMissingOperations(openapi, required = requiredOperations) {
  const paths = openapi?.paths ?? {};

  return required
    .filter(({ method, path }) => paths[path]?.[method.toLowerCase()] === undefined)
    .map(({ method, path }) => `${method} ${path}`);
}

async function readOpenapi(openapiPath) {
  const source = await readFile(openapiPath, "utf8");
  return parse(source);
}

export async function checkOpenapi(openapiPath) {
  const openapi = await readOpenapi(openapiPath);
  return findMissingOperations(openapi);
}

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const openapiPath = resolve(scriptDir, "../generated/openapi.yaml");
  const missing = await checkOpenapi(openapiPath);

  if (missing.length > 0) {
    console.error("OpenAPI contract check failed. Missing required operations:");
    for (const operation of missing) {
      console.error(`- ${operation}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `OpenAPI contract check passed: ${requiredOperations.length} required operations checked.`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
