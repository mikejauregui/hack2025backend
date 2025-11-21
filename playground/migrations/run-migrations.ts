#!/usr/bin/env bun
/**
 * Database Migration Runner
 * Runs all SQL migration files in order
 */

import { Glob, sql } from "bun";
import { join } from "path";

const MIGRATIONS_DIR = import.meta.dir;

interface Migration {
  filename: string;
  order: number;
}

async function loadMigrations(): Promise<Migration[]> {
  const glob = new Glob("*.sql");
  const migrations: Migration[] = [];

  for await (const filename of glob.scan(MIGRATIONS_DIR)) {
    const order = parseInt(filename.split("_")[0] || "0");

    migrations.push({
      filename,
      order,
    });
  }

  return migrations.sort((a, b) => a.order - b.order);
}

async function runMigration(migration: Migration): Promise<void> {
  console.log(`\n📦 Running migration: ${migration.filename}`);
  const filePath = join(MIGRATIONS_DIR, migration.filename);

  try {
    await sql.begin(async (tx) => {
      // Execute the migration file
      await tx.file(filePath);

      // Record the migration
      await tx`
        INSERT INTO schema_migrations (filename)
        VALUES (${migration.filename})
        ON CONFLICT (filename) DO NOTHING
      `;
    });
    console.log(`✅ Migration ${migration.filename} completed successfully`);
  } catch (error) {
    console.error(`❌ Migration ${migration.filename} failed:`);
    console.error(error);
    throw error;
  }
}

async function checkDatabaseConnection(): Promise<void> {
  console.log("🔍 Checking database connection...");

  try {
    const result =
      await sql`SELECT current_database(), current_user, version()`;
    console.log("✅ Database connection successful");
    console.log(`   Database: ${result[0].current_database}`);
    console.log(`   User: ${result[0].current_user}`);
    console.log(
      `   Version: ${result[0].version.split(" ")[0]} ${result[0].version.split(" ")[1]}`,
    );
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    throw error;
  }
}

async function createMigrationsTable(): Promise<void> {
  console.log("\n📋 Creating migrations tracking table...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id serial PRIMARY KEY,
        filename varchar(255) UNIQUE NOT NULL,
        executed_at timestamp with time zone DEFAULT now()
      )
    `;
    console.log("✅ Migrations tracking table ready");
  } catch (error) {
    console.error("❌ Failed to create migrations table:");
    console.error(error);
    throw error;
  }
}

async function getMigratedFiles(): Promise<string[]> {
  try {
    const result = await sql<{ filename: string }[]>`
      SELECT filename FROM schema_migrations ORDER BY id
    `;
    return result.map((r) => r.filename);
  } catch {
    // Table might not exist yet
    return [];
  }
}

async function main() {
  console.log("🚀 Starting database migrations...\n");

  try {
    // Check database connection
    await checkDatabaseConnection();

    // Create migrations tracking table
    await createMigrationsTable();

    // Load all migration files
    const migrations = await loadMigrations();
    console.log(`\n📁 Found ${migrations.length} migration files`);

    // Get already migrated files
    const migrated = await getMigratedFiles();
    console.log(`✓ ${migrated.length} migrations already applied`);

    // Filter out already migrated files
    const pending = migrations.filter((m) => !migrated.includes(m.filename));

    if (pending.length === 0) {
      console.log("\n✨ Database is up to date! No migrations to run.");
      return;
    }

    console.log(`\n⏳ Running ${pending.length} pending migrations...\n`);

    // Run each pending migration
    for (const migration of pending) {
      await runMigration(migration);
    }

    console.log("\n✨ All migrations completed successfully!");
    console.log("\n📊 Migration Summary:");
    console.log(`   Total migrations: ${migrations.length}`);
    console.log(`   Previously applied: ${migrated.length}`);
    console.log(`   Newly applied: ${pending.length}`);
  } catch (error) {
    console.error("\n💥 Migration failed!");
    console.error(error);
    process.exit(1);
  }
}

// Run migrations
main();
