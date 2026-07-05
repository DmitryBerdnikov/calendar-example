import { describe, expect, it } from "vitest";

import { createServer } from "./server";
import { createTestDatabase } from "./db/test-database";

const fixedNow = new Date("2026-07-05T12:00:00.000Z");

async function createAuthTestServer() {
  const testDatabase = createTestDatabase();
  const server = await createServer(undefined, {}, {
    db: testDatabase.db,
    now: () => fixedNow,
    generateSessionToken: () => "test-session-token",
  });

  return {
    db: testDatabase.db,
    server,
    close: async () => {
      await server.close();
      testDatabase.close();
    },
  };
}

describe("auth routes", () => {
  it("logs in the seeded organizer and creates a 24 hour session", async () => {
    const testServer = await createAuthTestServer();

    try {
      const response = await testServer.server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "organizer@example.com",
          password: "correct-horse-battery-staple",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        token: "test-session-token",
        organizer: {
          id: "usr_1",
          name: "Alex Organizer",
          email: "organizer@example.com",
          timezone: "Europe/Moscow",
        },
      });

      const session = testServer.db
        .prepare("SELECT organizer_id, expires_at, created_at FROM sessions WHERE token = ?")
        .get("test-session-token");

      expect(session).toEqual({
        organizer_id: "usr_1",
        expires_at: "2026-07-06T12:00:00.000Z",
        created_at: "2026-07-05T12:00:00.000Z",
      });
    } finally {
      await testServer.close();
    }
  });

  it("rejects invalid organizer credentials", async () => {
    const testServer = await createAuthTestServer();

    try {
      const response = await testServer.server.inject({
        method: "POST",
        url: "/auth/login",
        payload: {
          email: "organizer@example.com",
          password: "wrong-password",
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        code: "unauthenticated",
        message: "Invalid email or password.",
      });
    } finally {
      await testServer.close();
    }
  });

  it("returns the current organizer for a valid bearer token", async () => {
    const testServer = await createAuthTestServer();

    try {
      testServer.db
        .prepare(
          "INSERT INTO sessions (token, organizer_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        )
        .run(
          "valid-token",
          "usr_1",
          "2026-07-06T12:00:00.000Z",
          "2026-07-05T12:00:00.000Z",
        );

      const response = await testServer.server.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: "Bearer valid-token",
        },
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: "usr_1",
        name: "Alex Organizer",
        email: "organizer@example.com",
        timezone: "Europe/Moscow",
      });
    } finally {
      await testServer.close();
    }
  });

  it("rejects missing bearer tokens", async () => {
    const testServer = await createAuthTestServer();

    try {
      const response = await testServer.server.inject({
        method: "GET",
        url: "/auth/me",
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        code: "unauthenticated",
        message: "Missing bearer token.",
      });
    } finally {
      await testServer.close();
    }
  });

  it("rejects malformed bearer tokens", async () => {
    const testServer = await createAuthTestServer();

    try {
      const response = await testServer.server.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: "Basic invalid-token",
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        code: "unauthenticated",
        message: "Missing bearer token.",
      });
    } finally {
      await testServer.close();
    }
  });

  it("cleans up stale sessions before rejecting an expired token", async () => {
    const testServer = await createAuthTestServer();

    try {
      testServer.db
        .prepare(
          "INSERT INTO sessions (token, organizer_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        )
        .run(
          "expired-token",
          "usr_1",
          "2026-07-05T11:59:59.000Z",
          "2026-07-04T12:00:00.000Z",
        );

      const response = await testServer.server.inject({
        method: "GET",
        url: "/auth/me",
        headers: {
          authorization: "Bearer expired-token",
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        code: "unauthenticated",
        message: "Invalid or expired bearer token.",
      });
      expect(
        testServer.db
          .prepare("SELECT COUNT(*) AS count FROM sessions WHERE token = ?")
          .get("expired-token"),
      ).toEqual({ count: 0 });
    } finally {
      await testServer.close();
    }
  });
});
