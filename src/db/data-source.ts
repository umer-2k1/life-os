import "reflect-metadata";

import path from "node:path";
import { DataSource } from "typeorm";

import { ENTITIES } from "./entities";

/** Module-scoped: each server bundle gets its own pool with its own entity metadata. */
let cachedDataSource: DataSource | null = null;

export function createDataSource(): DataSource {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  return new DataSource({
    type: "postgres",
    url,
    ssl:
      process.env.DATABASE_SSL === "true"
        ? { rejectUnauthorized: false }
        : false,
    entities: ENTITIES,
    extra: {
      max: 2,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
    },
    migrations: [path.join(process.cwd(), "src/db/migrations/*.ts")],
    migrationsTableName: "lifeos_migrations",
    synchronize: false,
    logging: false,
  });
}

/** Singleton per module bundle. */
export async function getDataSource(): Promise<DataSource> {
  if (cachedDataSource?.isInitialized) return cachedDataSource;
  const ds = cachedDataSource ?? createDataSource();
  if (!ds.isInitialized) await ds.initialize();
  cachedDataSource = ds;
  return ds;
}

export { ENTITIES };
