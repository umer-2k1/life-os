import "reflect-metadata";

import path from "node:path";
import { DataSource } from "typeorm";

import { ENTITIES } from "./entities";

const globalCache = globalThis as unknown as {
  __lifeosDataSource?: DataSource;
};

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
