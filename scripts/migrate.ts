import "reflect-metadata";
import { createDataSource } from "../src/db/data-source";

async function main() {
  const ds = createDataSource();
  await ds.initialize();
  const applied = await ds.runMigrations();
  if (applied.length === 0) {
    console.log("No pending migrations.");
  } else {
    for (const m of applied) console.log(`✓ ${m.name}`);
  }
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
