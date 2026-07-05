import { pbkdf2Sync } from "node:crypto";

import type { DatabaseConnection } from "./database";

const seedTimestamp = "2026-07-01T09:00:00.000Z";
const seedOrganizerId = "usr_1";
const seedPasswordSalt = "demo-organizer-password-salt-v1";
const seedPasswordHash = hashPassword(
  "correct-horse-battery-staple",
  seedPasswordSalt,
);

const seedAvailabilityRules = [
  ["av_monday_workday", "monday"],
  ["av_tuesday_workday", "tuesday"],
  ["av_wednesday_workday", "wednesday"],
  ["av_thursday_workday", "thursday"],
  ["av_friday_workday", "friday"],
] as const;

export function seedDatabase(db: DatabaseConnection): void {
  const applySeed = db.transaction(() => {
    db.prepare(
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
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          email = excluded.email,
          timezone = excluded.timezone,
          password_hash = excluded.password_hash,
          password_salt = excluded.password_salt,
          updated_at = excluded.updated_at
      `,
    ).run(
      seedOrganizerId,
      "Alex Organizer",
      "organizer@example.com",
      "Europe/Moscow",
      seedPasswordHash,
      seedPasswordSalt,
      seedTimestamp,
      seedTimestamp,
    );

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
        ON CONFLICT(id) DO UPDATE SET
          organizer_id = excluded.organizer_id,
          title = excluded.title,
          slug = excluded.slug,
          description = excluded.description,
          duration_minutes = excluded.duration_minutes,
          is_active = excluded.is_active,
          updated_at = excluded.updated_at
      `,
    ).run(
      "evt_30m_intro",
      seedOrganizerId,
      "Intro Call",
      "intro-call",
      "A short introductory call.",
      30,
      1,
      seedTimestamp,
      seedTimestamp,
    );

    const upsertAvailabilityRule = db.prepare(
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
        ON CONFLICT(id) DO UPDATE SET
          organizer_id = excluded.organizer_id,
          weekday = excluded.weekday,
          start_time = excluded.start_time,
          end_time = excluded.end_time,
          updated_at = excluded.updated_at
      `,
    );

    for (const [id, weekday] of seedAvailabilityRules) {
      upsertAvailabilityRule.run(
        id,
        seedOrganizerId,
        weekday,
        "09:00",
        "17:00",
        seedTimestamp,
        seedTimestamp,
      );
    }
  });

  applySeed();
}

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
}
