import { describe, expect, it } from "vitest";

import { createServer } from "./server";

describe("createServer", () => {
  it("serves the local health endpoint", async () => {
    const server = await createServer();

    try {
      const response = await server.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: "ok" });
    } finally {
      await server.close();
    }
  });

  it("allows the local Vite origin by default", async () => {
    const server = await createServer();

    try {
      const response = await server.inject({
        method: "OPTIONS",
        url: "/health",
        headers: {
          origin: "http://127.0.0.1:5173",
          "access-control-request-method": "GET",
        },
      });

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://127.0.0.1:5173",
      );
    } finally {
      await server.close();
    }
  });
});
