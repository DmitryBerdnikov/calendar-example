import { openDatabase, type DatabaseConnection } from "./database";
import { runMigrations } from "./migrate";
import { seedDatabase } from "./seed";

type TestDatabaseOptions = {
  seed?: boolean;
};

type TestDatabase = {
  db: DatabaseConnection;
  close: () => void;
};

export function createTestDatabase(
  options: TestDatabaseOptions = {},
): TestDatabase {
  const shouldSeed = options.seed ?? true;
  const db = openDatabase(":memory:");

  runMigrations(db);

  if (shouldSeed) {
    seedDatabase(db);
  }

  return {
    db,
    close: () => db.close(),
  };
}
