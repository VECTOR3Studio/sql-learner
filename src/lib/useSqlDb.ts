"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Database, SqlJsStatic } from "sql.js";
import { SANDBOX_TABLES } from "@/data/sandbox";

export interface QueryResult {
  columns: string[];
  rows: (string | number | null | Uint8Array)[][];
}

export interface RunOutcome {
  results: QueryResult[];
  error?: string;
  /** rows changed by the last non-SELECT statement, if any. */
  rowsModified?: number;
}

let sqlJsPromise: Promise<SqlJsStatic> | null = null;

async function getSqlJs(): Promise<SqlJsStatic> {
  if (!sqlJsPromise) {
    // dynamic import keeps the wasm loader out of the server bundle
    sqlJsPromise = import("sql.js").then((mod) =>
      mod.default({ locateFile: () => "/sql-wasm.wasm" }),
    );
  }
  return sqlJsPromise;
}

function seedDatabase(db: Database) {
  for (const t of SANDBOX_TABLES) {
    db.run(t.ddl);
    for (const stmt of t.seed) db.run(stmt);
  }
}

export function useSqlDb() {
  const dbRef = useRef<Database | null>(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSqlJs()
      .then((SQL) => {
        if (cancelled) return;
        const db = new SQL.Database();
        seedDatabase(db);
        dbRef.current = db;
        setReady(true);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(String(e?.message ?? e));
      });
    return () => {
      cancelled = true;
      dbRef.current?.close();
      dbRef.current = null;
    };
  }, []);

  const run = useCallback((sql: string): RunOutcome => {
    const db = dbRef.current;
    if (!db) return { results: [], error: "Database not ready yet." };
    try {
      const results = db.exec(sql).map((r) => ({
        columns: r.columns,
        rows: r.values as QueryResult["rows"],
      }));
      let rowsModified: number | undefined;
      try {
        rowsModified = db.getRowsModified();
      } catch {
        /* not all builds expose this */
      }
      return { results, rowsModified };
    } catch (e: unknown) {
      return { results: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, []);

  const reset = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    // drop everything and reseed
    for (const t of [...SANDBOX_TABLES].reverse()) {
      try {
        db.run(`DROP TABLE IF EXISTS ${t.name};`);
      } catch {
        /* ignore */
      }
    }
    seedDatabase(db);
  }, []);

  return { ready, loadError, run, reset };
}
