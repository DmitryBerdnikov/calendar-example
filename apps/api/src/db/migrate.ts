import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { DatabaseConnection } from "./database";

const defaultMigrationsPath = fileURLToPath(
  new URL("./migrations", import.meta.url),
);

type Migration = {
  id: string;
  sql: string;
};

export function runMigrations(
  db: DatabaseConnection,
  migrationsPath = defaultMigrationsPath,
): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedMigrationIds = new Set(
    db
      .prepare("SELECT id FROM schema_migrations")
      .all()
      .map((row) => (row as { id: string }).id),
  );

  const migrations = readMigrations(migrationsPath);
  const applyMigration = db.transaction((migration: Migration) => {
    db.exec(migration.sql);
    db.prepare(
      "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
    ).run(migration.id, new Date().toISOString());
  });

  for (const migration of migrations) {
    if (!appliedMigrationIds.has(migration.id)) {
      applyMigration(migration);
    }
  }
}

function readMigrations(migrationsPath: string): Migration[] {
  return readdirSync(migrationsPath)
    .filter((fileName) => extname(fileName) === ".sql")
    .sort()
    .map((fileName) => ({
      id: fileName.replace(/\.sql$/, ""),
      sql: readFileSync(join(migrationsPath, fileName), "utf8"),
    }));
}
