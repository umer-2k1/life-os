import "reflect-metadata";
import { ensureBootstrap } from "../src/core/bootstrap";
import { getDataSource } from "../src/db/data-source";

async function main() {
  const ds = await getDataSource();
  const rows = await ds.query("select count(*)::int as c from dreams");
  const count = rows[0].c as number;
  if (count > 0) {
    console.log(`Already ${count} dreams. Nothing seeded.`);
  } else {
    await ensureBootstrap();
    const after = await ds.query("select count(*)::int as c from dreams");
    console.log(`✓ seeded ${after[0].c} dreams`);
  }
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
