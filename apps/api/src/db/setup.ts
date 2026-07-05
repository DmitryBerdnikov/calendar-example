import { createApiConfig } from "../config";
import { openDatabase } from "./database";
import { runMigrations } from "./migrate";
import { seedDatabase } from "./seed";

const config = createApiConfig();
const db = openDatabase(config.databasePath);

try {
  runMigrations(db);
  seedDatabase(db);
} finally {
  db.close();
}
