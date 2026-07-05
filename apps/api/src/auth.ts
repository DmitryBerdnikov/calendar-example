import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

import { z } from "zod";

import type { DatabaseConnection } from "./db/database";

const sessionTtlMilliseconds = 24 * 60 * 60 * 1000;

export type ErrorResponse = {
  code:
    | "invalid_request"
    | "unauthenticated"
    | "forbidden"
    | "not_found"
    | "conflict";
  message: string;
  details?: unknown;
};

export type OrganizerResponse = {
  id: string;
  name: string;
  email: string;
  timezone: "Europe/Moscow";
};

export type LoginResponse = {
  token: string;
  organizer: OrganizerResponse;
};

export type AuthDependencies = {
  db: DatabaseConnection;
  now?: () => Date;
  generateSessionToken?: () => string;
};

export const loginRequestSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

type OrganizerRow = {
  id: string;
  name: string;
  email: string;
  timezone: "Europe/Moscow";
  password_hash: string;
  password_salt: string;
};

type SessionOrganizerRow = {
  id: string;
  name: string;
  email: string;
  timezone: "Europe/Moscow";
};

export function createAuthService(dependencies: AuthDependencies) {
  const now = dependencies.now ?? (() => new Date());
  const generateSessionToken =
    dependencies.generateSessionToken ?? defaultGenerateSessionToken;

  return {
    login(email: string, password: string): LoginResponse | null {
      const organizer = dependencies.db
        .prepare(
          `
            SELECT id, name, email, timezone, password_hash, password_salt
            FROM organizers
            WHERE lower(email) = lower(?)
          `,
        )
        .get(email.trim()) as OrganizerRow | undefined;

      if (!organizer || !verifyPassword(password, organizer)) {
        return null;
      }

      const createdAt = now();
      const expiresAt = new Date(
        createdAt.getTime() + sessionTtlMilliseconds,
      ).toISOString();
      const token = generateSessionToken();

      dependencies.db
        .prepare(
          `
            INSERT INTO sessions (token, organizer_id, expires_at, created_at)
            VALUES (?, ?, ?, ?)
          `,
        )
        .run(token, organizer.id, expiresAt, createdAt.toISOString());

      return {
        token,
        organizer: toOrganizerResponse(organizer),
      };
    },

    getOrganizerForBearerToken(token: string): OrganizerResponse | null {
      dependencies.db
        .prepare("DELETE FROM sessions WHERE expires_at <= ?")
        .run(now().toISOString());

      const organizer = dependencies.db
        .prepare(
          `
            SELECT organizers.id, organizers.name, organizers.email, organizers.timezone
            FROM sessions
            INNER JOIN organizers ON organizers.id = sessions.organizer_id
            WHERE sessions.token = ?
          `,
        )
        .get(token) as SessionOrganizerRow | undefined;

      if (!organizer) {
        return null;
      }

      return toOrganizerResponse(organizer);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;

export function extractBearerToken(
  authorizationHeader: string | undefined,
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const match = /^Bearer\s+(.+)$/.exec(authorizationHeader);

  if (!match || !match[1].trim()) {
    return null;
  }

  return match[1].trim();
}

function verifyPassword(password: string, organizer: OrganizerRow): boolean {
  const candidateHash = pbkdf2Sync(
    password,
    organizer.password_salt,
    100_000,
    64,
    "sha512",
  ).toString("hex");

  const storedHash = Buffer.from(organizer.password_hash, "hex");
  const candidateHashBuffer = Buffer.from(candidateHash, "hex");

  return (
    storedHash.length === candidateHashBuffer.length &&
    timingSafeEqual(storedHash, candidateHashBuffer)
  );
}

function defaultGenerateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

function toOrganizerResponse(row: OrganizerRow | SessionOrganizerRow): OrganizerResponse {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    timezone: row.timezone,
  };
}
