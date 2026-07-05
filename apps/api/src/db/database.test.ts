import { describe, expect, it } from "vitest";

import type { DatabaseConnection } from "./database";
import { runMigrations } from "./migrate";
import { seedDatabase } from "./seed";
import { createTestDatabase } from "./test-database";

function getTables(db: DatabaseConnection): string[] {
  return db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
    )
    .all()
    .map((row) => (row as { name: string }).name);
}

function getCount(db: DatabaseConnection, tableName: string): number {
  const row = db
    .prepare(`SELECT COUNT(*) AS count FROM ${tableName}`)
    .get() as { count: number };

  return row.count;
}

describe("runMigrations", () => {
  it("creates the foundation schema once", () => {
    const testDatabase = createTestDatabase({ seed: false });

    try {
      runMigrations(testDatabase.db);
      runMigrations(testDatabase.db);

      expect(getTables(testDatabase.db)).toEqual([
        "availability_rules",
        "bookings",
        "event_types",
        "organizers",
        "schema_migrations",
        "sessions",
      ]);
      expect(getCount(testDatabase.db, "schema_migrations")).toBe(2);
    } finally {
      testDatabase.close();
    }
  });

  it("enforces public slug uniqueness across organizers", () => {
    const testDatabase = createTestDatabase();

    try {
      testDatabase.db
        .prepare(
          `
            INSERT INTO organizers (
              id,
              name,
              email,
              timezone,
              password_hash,
              password_salt,
              created_at,
              updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
        )
        .run(
          "usr_2",
          "Second Organizer",
          "second@example.com",
          "Europe/Moscow",
          "hash",
          "salt",
          "2026-07-05T12:00:00.000Z",
          "2026-07-05T12:00:00.000Z",
        );

      expect(() =>
        testDatabase.db
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
            "evt_duplicate_slug",
            "usr_2",
            "Duplicate Intro",
            "intro-call",
            "A duplicate public slug.",
            30,
            1,
            "2026-07-05T12:00:00.000Z",
            "2026-07-05T12:00:00.000Z",
          ),
      ).toThrow();
    } finally {
      testDatabase.close();
    }
  });

  it("rejects availability times outside the local 24-hour clock", () => {
    const testDatabase = createTestDatabase();

    try {
      expect(() =>
        testDatabase.db
          .prepare(
            `
              INSERT INTO availability_rules (
                id,
                organizer_id,
                weekday,
                start_time,
                end_time,
                created_at,
                updated_at
              )
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
          )
          .run(
            "av_invalid_time",
            "usr_1",
            "monday",
            "23:30",
            "29:00",
            "2026-07-05T12:00:00.000Z",
            "2026-07-05T12:00:00.000Z",
          ),
      ).toThrow();
    } finally {
      testDatabase.close();
    }
  });
});

describe("seedDatabase", () => {
  it("can be applied repeatedly without creating duplicate demo data", () => {
    const testDatabase = createTestDatabase({ seed: false });

    try {
      seedDatabase(testDatabase.db);
      seedDatabase(testDatabase.db);

      expect(getCount(testDatabase.db, "organizers")).toBe(1);
      expect(getCount(testDatabase.db, "event_types")).toBe(1);
      expect(getCount(testDatabase.db, "availability_rules")).toBe(5);
      expect(getCount(testDatabase.db, "bookings")).toBe(0);

      const organizer = testDatabase.db
        .prepare(
          "SELECT email, password_hash, password_salt FROM organizers WHERE id = ?",
        )
        .get("usr_1") as {
        email: string;
        password_hash: string;
        password_salt: string;
      };

      expect(organizer.email).toBe("organizer@example.com");
      expect(organizer.password_hash).not.toBe(
        "correct-horse-battery-staple",
      );
      expect(organizer.password_salt.length).toBeGreaterThan(0);
    } finally {
      testDatabase.close();
    }
  });
});

describe("createTestDatabase", () => {
  it("returns isolated migrated in-memory databases", () => {
    const firstDatabase = createTestDatabase();
    const secondDatabase = createTestDatabase();

    try {
      firstDatabase.db
        .prepare(
          "INSERT INTO sessions (token, organizer_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
        )
        .run(
          "session_1",
          "usr_1",
          "2026-07-06T12:00:00.000Z",
          "2026-07-05T12:00:00.000Z",
        );

      expect(getCount(firstDatabase.db, "sessions")).toBe(1);
      expect(getCount(secondDatabase.db, "sessions")).toBe(0);
    } finally {
      firstDatabase.close();
      secondDatabase.close();
    }
  });
});
