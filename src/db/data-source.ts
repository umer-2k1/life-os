import "reflect-metadata";

import fs from "node:fs";
import path from "node:path";
import { DataSource } from "typeorm";

import { ENTITIES } from "./entities";

const globalCache = globalThis as unknown as {
  __lifeosDataSource?: DataSource;
};

function isSqlite(url: string | undefined): boolean {
  return !url || url.startsWith("sqlite:") || url.startsWith("file:");
}

function sqliteFile(url: string | undefined): string {
  if (url) {
    const cleaned = url.replace(/^sqlite:(\/\/)?/, "");
    if (cleaned) return path.isAbsolute(cleaned) ? cleaned : path.join(process.cwd(), cleaned);
  }
  return path.join(process.cwd(), ".data", "lifeos.db");
}

export function createDataSource(): DataSource {
  const url = process.env.DATABASE_URL;

  if (isSqlite(url)) {
    const file = sqliteFile(url);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    return new DataSource({
      type: "better-sqlite3",
      database: file,
      entities: ENTITIES,
      synchronize: true,
      logging: false,
    });
  }

  return new DataSource({
    type: "postgres",
    url,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
    entities: ENTITIES,
    migrations: [path.join(process.cwd(), "src/db/migrations/*.ts")],
    migrationsTableName: "lifeos_migrations",
    synchronize: false,
    logging: false,
  });
}

/** Singleton — survives Next.js dev hot reloads. */
export async function getDataSource(): Promise<DataSource> {
  const existing = globalCache.__lifeosDataSource;
  if (existing?.isInitialized) return existing;
  const ds = existing ?? createDataSource();
  if (!ds.isInitialized) await ds.initialize();
  globalCache.__lifeosDataSource = ds;
  return ds;
}

export { ENTITIES };
