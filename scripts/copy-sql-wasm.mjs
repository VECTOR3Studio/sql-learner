// Copies the sql.js WASM binary into /public so the browser can load it from a
// stable URL (locateFile -> "/sql-wasm.wasm"). Runs automatically after install.
import { copyFile, mkdir, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const src = resolve(root, "node_modules/sql.js/dist/sql-wasm.wasm");
const destDir = resolve(root, "public");
const dest = resolve(destDir, "sql-wasm.wasm");

try {
  await access(src);
  await mkdir(destDir, { recursive: true });
  await copyFile(src, dest);
  console.log("[copy-sql-wasm] copied sql-wasm.wasm -> public/");
} catch (err) {
  console.warn("[copy-sql-wasm] skipped:", err.message);
}
