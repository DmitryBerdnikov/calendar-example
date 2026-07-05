import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import Database from "better-sqlite3";

export type DatabaseConnection = Database.Database;

export function openDatabase(databasePath: string): DatabaseConnection {
  if (databasePath !== ":memory:") {
    mkdirSync(dirname(databasePath), { recursive: true });
  }

  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");

  if (databasePath !== ":memory:") {
    db.pragma("journal_mode = WAL");
  }

  return db;
}
