/**
 * Database initialization and migrations.
 * Reads schema.sql and executes it against the SQLite database.
 */
import Database from "better-sqlite3"
import { readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))

export function initializeDatabase(dbPath: string): Database.Database {
  const db = new Database(dbPath)

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL")
  db.pragma("foreign_keys = ON")

  // Run schema
  const schema = readFileSync(join(__dirname, "schema.sql"), "utf-8")
  db.exec(schema)

  console.error("[antovel-mcp] Database initialized at", dbPath)
  return db
}
