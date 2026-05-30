// Validates the sandbox schema + seed + every example query against a real
// SQLite engine (sql.js), exactly as the browser sandbox will. Run with:
//   node --experimental-strip-types scripts/check-sandbox.mts
import initSqlJs from "sql.js";
import { SANDBOX_TABLES, SANDBOX_EXAMPLES } from "../src/data/sandbox.ts";

const SQL = await initSqlJs({});
const db = new SQL.Database();

let failures = 0;

for (const t of SANDBOX_TABLES) {
  try {
    db.run(t.ddl);
    for (const s of t.seed) db.run(s);
    console.log(`OK  schema+seed: ${t.name} (${t.seed.length} riadkov)`);
  } catch (e) {
    failures++;
    console.error(`FAIL schema/seed ${t.name}: ${(e as Error).message}`);
  }
}

for (const ex of SANDBOX_EXAMPLES) {
  try {
    const res = db.exec(ex.sql);
    const rows = res[0]?.values.length ?? 0;
    console.log(`OK  dopyt: ${ex.label} -> ${rows} riadkov`);
  } catch (e) {
    failures++;
    console.error(`FAIL dopyt "${ex.label}": ${(e as Error).message}`);
  }
}

db.close();
console.log(failures === 0 ? "\nALL GOOD ✓" : `\n${failures} FAILURE(S) ✗`);
process.exit(failures === 0 ? 0 : 1);
