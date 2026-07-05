import { randomUUID } from "node:crypto";

import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  extractBearerToken,
  type AuthService,
  type ErrorResponse,
  type OrganizerResponse,
} from "./auth";
import type { DatabaseConnection } from "./db/database";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const eventTypeCreateSchema = z.object({
  title: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().min(1),
  durationMinutes: z.number().int().positive(),
  isActive: z.boolean(),
});

const eventTypeUpdateSchema = z.object({
  title: z.string().trim().min(1).optional(),
  slug: slugSchema.optional(),
  description: z.string().trim().min(1).optional(),
  durationMinutes: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

type EventTypeUpdateInput = z.infer<typeof eventTypeUpdateSchema>;

export type EventTypeResponse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type EventTypeRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration_minutes: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type EventTypeRouteDependencies = {
  db: DatabaseConnection;
  authService: AuthService;
  now?: () => Date;
};

export function registerEventTypeRoutes(
  server: FastifyInstance,
  dependencies: EventTypeRouteDependencies,
): void {
  const now = dependencies.now ?? (() => new Date());

  server.get("/event-types", async (request, reply) => {
    const organizer = authenticateOrganizer(
      request,
      reply,
      dependencies.authService,
    );

    if (!organizer) {
      return;
    }

    return listEventTypes(dependencies.db, organizer.id);
  });

  server.post("/event-types", async (request, reply) => {
    const organizer = authenticateOrganizer(
      request,
      reply,
      dependencies.authService,
    );

    if (!organizer) {
      return;
    }

    const parsedBody = eventTypeCreateSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return sendInvalidRequest(reply, parsedBody.error.flatten());
    }

    if (isSlugInUse(dependencies.db, parsedBody.data.slug)) {
      return sendDuplicateSlug(reply);
    }

    const timestamp = now().toISOString();
    const id = `evt_${randomUUID()}`;

    try {
      dependencies.db
        .prepare(
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
        )
        .run(
          id,
          organizer.id,
          parsedBody.data.title,
          parsedBody.data.slug,
          parsedBody.data.description,
          parsedBody.data.durationMinutes,
          parsedBody.data.isActive ? 1 : 0,
          timestamp,
          timestamp,
        );
    } catch (error) {
      if (isSqliteConstraintError(error)) {
        return sendDuplicateSlug(reply);
      }

      throw error;
    }

    return reply
      .code(201)
      .send(getEventType(dependencies.db, organizer.id, id));
  });

  server.get("/event-types/:id", async (request, reply) => {
    const organizer = authenticateOrganizer(
      request,
      reply,
      dependencies.authService,
    );

    if (!organizer) {
      return;
    }

    const eventType = getEventType(
      dependencies.db,
      organizer.id,
      getIdParam(request),
    );

    if (!eventType) {
      return sendNotFound(reply);
    }

    return eventType;
  });

  server.patch("/event-types/:id", async (request, reply) => {
    const organizer = authenticateOrganizer(
      request,
      reply,
      dependencies.authService,
    );

    if (!organizer) {
      return;
    }

    const id = getIdParam(request);
    const current = getEventType(dependencies.db, organizer.id, id);

    if (!current) {
      return sendNotFound(reply);
    }

    const parsedBody = eventTypeUpdateSchema.safeParse(request.body);

    if (!parsedBody.success) {
      return sendInvalidRequest(reply, parsedBody.error.flatten());
    }

    if (isEmptyUpdate(parsedBody.data)) {
      return current;
    }

    if (
      parsedBody.data.slug &&
      parsedBody.data.slug !== current.slug &&
      isSlugInUse(dependencies.db, parsedBody.data.slug, id)
    ) {
      return sendDuplicateSlug(reply);
    }

    try {
      updateEventType(
        dependencies.db,
        organizer.id,
        id,
        parsedBody.data,
        current,
        now().toISOString(),
      );
    } catch (error) {
      if (isSqliteConstraintError(error)) {
        return sendDuplicateSlug(reply);
      }

      throw error;
    }

    return getEventType(dependencies.db, organizer.id, id);
  });

  server.delete("/event-types/:id", async (request, reply) => {
    const organizer = authenticateOrganizer(
      request,
      reply,
      dependencies.authService,
    );

    if (!organizer) {
      return;
    }

    const id = getIdParam(request);
    const eventType = getEventType(dependencies.db, organizer.id, id);

    if (!eventType) {
      return sendNotFound(reply);
    }

    if (hasBookings(dependencies.db, id)) {
      return reply.code(409).send({
        code: "conflict",
        message: "Event type has existing bookings and cannot be deleted.",
      });
    }

    dependencies.db
      .prepare("DELETE FROM event_types WHERE id = ? AND organizer_id = ?")
      .run(id, organizer.id);

    return reply.code(204).send();
  });

  server.post("/event-types/:id/activate", async (request, reply) => {
    return setEventTypeActiveState(
      request,
      reply,
      dependencies,
      true,
      now().toISOString(),
    );
  });

  server.post("/event-types/:id/deactivate", async (request, reply) => {
    return setEventTypeActiveState(
      request,
      reply,
      dependencies,
      false,
      now().toISOString(),
    );
  });
}

function authenticateOrganizer(
  request: FastifyRequest,
  reply: FastifyReply,
  authService: AuthService,
): OrganizerResponse | null {
  const token = extractBearerToken(request.headers.authorization);

  if (!token) {
    reply.code(401).send({
      code: "unauthenticated",
      message: "Missing bearer token.",
    } satisfies ErrorResponse);
    return null;
  }

  const organizer = authService.getOrganizerForBearerToken(token);

  if (!organizer) {
    reply.code(401).send({
      code: "unauthenticated",
      message: "Invalid or expired bearer token.",
    } satisfies ErrorResponse);
    return null;
  }

  return organizer;
}

function setEventTypeActiveState(
  request: FastifyRequest,
  reply: FastifyReply,
  dependencies: EventTypeRouteDependencies,
  isActive: boolean,
  updatedAt: string,
): EventTypeResponse | undefined {
  const organizer = authenticateOrganizer(
    request,
    reply,
    dependencies.authService,
  );

  if (!organizer) {
    return undefined;
  }

  const id = getIdParam(request);
  const current = getEventType(dependencies.db, organizer.id, id);

  if (!current) {
    sendNotFound(reply);
    return undefined;
  }

  dependencies.db
    .prepare(
      `
        UPDATE event_types
        SET is_active = ?, updated_at = ?
        WHERE id = ? AND organizer_id = ?
      `,
    )
    .run(isActive ? 1 : 0, updatedAt, id, organizer.id);

  return getEventType(dependencies.db, organizer.id, id) ?? undefined;
}

function listEventTypes(
  db: DatabaseConnection,
  organizerId: string,
): EventTypeResponse[] {
  return db
    .prepare(
      `
        SELECT
          id,
          title,
          slug,
          description,
          duration_minutes,
          is_active,
          created_at,
          updated_at
        FROM event_types
        WHERE organizer_id = ?
        ORDER BY created_at DESC, id ASC
      `,
    )
    .all(organizerId)
    .map((row) => toEventTypeResponse(row as EventTypeRow));
}

function getEventType(
  db: DatabaseConnection,
  organizerId: string,
  id: string,
): EventTypeResponse | null {
  const row = db
    .prepare(
      `
        SELECT
          id,
          title,
          slug,
          description,
          duration_minutes,
          is_active,
          created_at,
          updated_at
        FROM event_types
        WHERE id = ? AND organizer_id = ?
      `,
    )
    .get(id, organizerId) as EventTypeRow | undefined;

  return row ? toEventTypeResponse(row) : null;
}

function updateEventType(
  db: DatabaseConnection,
  organizerId: string,
  id: string,
  input: EventTypeUpdateInput,
  current: EventTypeResponse,
  updatedAt: string,
): void {
  db.prepare(
    `
      UPDATE event_types
      SET
        title = ?,
        slug = ?,
        description = ?,
        duration_minutes = ?,
        is_active = ?,
        updated_at = ?
      WHERE id = ? AND organizer_id = ?
    `,
  ).run(
    input.title ?? current.title,
    input.slug ?? current.slug,
    input.description ?? current.description,
    input.durationMinutes ?? current.durationMinutes,
    (input.isActive ?? current.isActive) ? 1 : 0,
    updatedAt,
    id,
    organizerId,
  );
}

function isSlugInUse(
  db: DatabaseConnection,
  slug: string,
  exceptEventTypeId?: string,
): boolean {
  const row = db
    .prepare(
      `
        SELECT id
        FROM event_types
        WHERE slug = ? AND (? IS NULL OR id <> ?)
        LIMIT 1
      `,
    )
    .get(slug, exceptEventTypeId ?? null, exceptEventTypeId ?? null);

  return Boolean(row);
}

function hasBookings(db: DatabaseConnection, eventTypeId: string): boolean {
  const row = db
    .prepare(
      "SELECT COUNT(*) AS count FROM bookings WHERE event_type_id = ?",
    )
    .get(eventTypeId) as { count: number };

  return row.count > 0;
}

function isEmptyUpdate(input: EventTypeUpdateInput): boolean {
  return Object.keys(input).length === 0;
}

function getIdParam(request: FastifyRequest): string {
  return (request.params as { id: string }).id;
}

function sendInvalidRequest(reply: FastifyReply, details: unknown) {
  return reply.code(400).send({
    code: "invalid_request",
    message: "Request body is invalid.",
    details,
  } satisfies ErrorResponse);
}

function sendNotFound(reply: FastifyReply) {
  return reply.code(404).send({
    code: "not_found",
    message: "Event type was not found.",
  } satisfies ErrorResponse);
}

function sendDuplicateSlug(reply: FastifyReply) {
  return reply.code(409).send({
    code: "conflict",
    message: "Event type slug is already in use.",
  } satisfies ErrorResponse);
}

function isSqliteConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    error.code.startsWith("SQLITE_CONSTRAINT")
  );
}

function toEventTypeResponse(row: EventTypeRow): EventTypeResponse {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    durationMinutes: row.duration_minutes,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
