import { describe, expect, it } from "vitest";

import type { DatabaseConnection } from "./db/database";
import { createTestDatabase } from "./db/test-database";
import { createServer } from "./server";

const fixedNow = new Date("2026-07-05T12:00:00.000Z");
const authHeaders = {
  authorization: "Bearer valid-token",
};

async function createEventTypesTestServer() {
  const testDatabase = createTestDatabase();
  const server = await createServer(undefined, {}, {
    db: testDatabase.db,
    now: () => fixedNow,
  });

  testDatabase.db
    .prepare(
      "INSERT INTO sessions (token, organizer_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(
      "valid-token",
      "usr_1",
      "2026-07-06T12:00:00.000Z",
      "2026-07-05T12:00:00.000Z",
    );

  return {
    db: testDatabase.db,
    server,
    close: async () => {
      await server.close();
      testDatabase.close();
    },
  };
}

function insertEventType(
  db: DatabaseConnection,
  values: { id: string; slug: string },
) {
  db.prepare(
    `
      INSERT INTO event_types (
        id,
        organizer_id,
        title,
        slug,
        description,
        duration_minutes,
        is_active,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    values.id,
    "usr_1",
    "Strategy Call",
    values.slug,
    "A focused strategy session.",
    45,
    0,
    "2026-07-04T10:00:00.000Z",
    "2026-07-04T10:00:00.000Z",
  );
}

function insertCancelledBooking(db: DatabaseConnection, eventTypeId: string) {
  db.prepare(
    `
      INSERT INTO bookings (
        id,
        organizer_id,
        event_type_id,
        event_type_title,
        guest_name,
        guest_email,
        start_at,
        end_at,
        status,
        cancelled_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    "bk_cancelled",
    "usr_1",
    eventTypeId,
    "Intro Call",
    "Maria Guest",
    "maria@example.com",
    "2026-07-06T07:00:00.000Z",
    "2026-07-06T07:30:00.000Z",
    "cancelled",
    "2026-07-05T10:00:00.000Z",
    "2026-07-05T09:00:00.000Z",
    "2026-07-05T10:00:00.000Z",
  );
}

describe("event type routes", () => {
  it("requires an organizer session", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      const response = await testServer.server.inject({
        method: "GET",
        url: "/event-types",
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

  it("lists persisted event types for the authenticated organizer", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      const response = await testServer.server.inject({
        method: "GET",
        url: "/event-types",
        headers: authHeaders,
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([
        {
          id: "evt_30m_intro",
          title: "Intro Call",
          slug: "intro-call",
          description: "A short introductory call.",
          durationMinutes: 30,
          isActive: true,
          createdAt: "2026-07-01T09:00:00.000Z",
          updatedAt: "2026-07-01T09:00:00.000Z",
        },
      ]);
    } finally {
      await testServer.close();
    }
  });

  it("creates, gets, updates, and deletes an event type", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      const createResponse = await testServer.server.inject({
        method: "POST",
        url: "/event-types",
        headers: authHeaders,
        payload: {
          title: "  Discovery Call  ",
          slug: " discovery-call ",
          description: " A focused discovery session. ",
          durationMinutes: 45,
          isActive: false,
        },
      });

      expect(createResponse.statusCode).toBe(201);
      const created = createResponse.json();
      expect(created).toEqual({
        id: expect.stringMatching(/^evt_/),
        title: "Discovery Call",
        slug: "discovery-call",
        description: "A focused discovery session.",
        durationMinutes: 45,
        isActive: false,
        createdAt: "2026-07-05T12:00:00.000Z",
        updatedAt: "2026-07-05T12:00:00.000Z",
      });

      const getResponse = await testServer.server.inject({
        method: "GET",
        url: `/event-types/${created.id}`,
        headers: authHeaders,
      });

      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.json()).toEqual(created);

      const updateResponse = await testServer.server.inject({
        method: "PATCH",
        url: `/event-types/${created.id}`,
        headers: authHeaders,
        payload: {
          title: "Strategy Call",
          durationMinutes: 60,
          isActive: true,
        },
      });

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.json()).toEqual({
        ...created,
        title: "Strategy Call",
        durationMinutes: 60,
        isActive: true,
        updatedAt: "2026-07-05T12:00:00.000Z",
      });

      const deleteResponse = await testServer.server.inject({
        method: "DELETE",
        url: `/event-types/${created.id}`,
        headers: authHeaders,
      });

      expect(deleteResponse.statusCode).toBe(204);

      const deletedGetResponse = await testServer.server.inject({
        method: "GET",
        url: `/event-types/${created.id}`,
        headers: authHeaders,
      });

      expect(deletedGetResponse.statusCode).toBe(404);
    } finally {
      await testServer.close();
    }
  });

  it("rejects invalid slugs", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      const response = await testServer.server.inject({
        method: "POST",
        url: "/event-types",
        headers: authHeaders,
        payload: {
          title: "Bad Slug",
          slug: "Bad Slug",
          description: "A booking option with a bad slug.",
          durationMinutes: 30,
          isActive: true,
        },
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toMatchObject({
        code: "invalid_request",
        message: "Request body is invalid.",
      });
    } finally {
      await testServer.close();
    }
  });

  it("returns conflict when creating or updating to a duplicate slug", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      insertEventType(testServer.db, {
        id: "evt_strategy",
        slug: "strategy-call",
      });

      const createResponse = await testServer.server.inject({
        method: "POST",
        url: "/event-types",
        headers: authHeaders,
        payload: {
          title: "Intro Duplicate",
          slug: "intro-call",
          description: "A duplicate booking option.",
          durationMinutes: 30,
          isActive: true,
        },
      });

      expect(createResponse.statusCode).toBe(409);
      expect(createResponse.json()).toEqual({
        code: "conflict",
        message: "Event type slug is already in use.",
      });

      const updateResponse = await testServer.server.inject({
        method: "PATCH",
        url: "/event-types/evt_strategy",
        headers: authHeaders,
        payload: {
          slug: "intro-call",
        },
      });

      expect(updateResponse.statusCode).toBe(409);
      expect(updateResponse.json()).toEqual({
        code: "conflict",
        message: "Event type slug is already in use.",
      });
    } finally {
      await testServer.close();
    }
  });

  it("treats an empty update body as a no-op", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      const response = await testServer.server.inject({
        method: "PATCH",
        url: "/event-types/evt_30m_intro",
        headers: authHeaders,
        payload: {},
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        id: "evt_30m_intro",
        title: "Intro Call",
        slug: "intro-call",
        description: "A short introductory call.",
        durationMinutes: 30,
        isActive: true,
        createdAt: "2026-07-01T09:00:00.000Z",
        updatedAt: "2026-07-01T09:00:00.000Z",
      });
    } finally {
      await testServer.close();
    }
  });

  it("activates and deactivates an event type", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      const deactivateResponse = await testServer.server.inject({
        method: "POST",
        url: "/event-types/evt_30m_intro/deactivate",
        headers: authHeaders,
      });

      expect(deactivateResponse.statusCode).toBe(200);
      expect(deactivateResponse.json()).toMatchObject({
        id: "evt_30m_intro",
        isActive: false,
        updatedAt: "2026-07-05T12:00:00.000Z",
      });

      const activateResponse = await testServer.server.inject({
        method: "POST",
        url: "/event-types/evt_30m_intro/activate",
        headers: authHeaders,
      });

      expect(activateResponse.statusCode).toBe(200);
      expect(activateResponse.json()).toMatchObject({
        id: "evt_30m_intro",
        isActive: true,
        updatedAt: "2026-07-05T12:00:00.000Z",
      });
    } finally {
      await testServer.close();
    }
  });

  it("rejects deleting an event type with existing bookings", async () => {
    const testServer = await createEventTypesTestServer();

    try {
      insertCancelledBooking(testServer.db, "evt_30m_intro");

      const response = await testServer.server.inject({
        method: "DELETE",
        url: "/event-types/evt_30m_intro",
        headers: authHeaders,
      });

      expect(response.statusCode).toBe(409);
      expect(response.json()).toEqual({
        code: "conflict",
        message: "Event type has existing bookings and cannot be deleted.",
      });
    } finally {
      await testServer.close();
    }
  });
});
