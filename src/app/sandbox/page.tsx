"use client";

import { useMemo, useState } from "react";
import { Card, Badge } from "@/components/ui";
import { useSqlDb, type RunOutcome } from "@/lib/useSqlDb";
import { useLocalStorage } from "@/lib/storage";
import { SANDBOX_TABLES, SANDBOX_EXAMPLES } from "@/data/sandbox";

// Oracle constructs that have no equivalent in the SQLite sandbox engine.
const ORACLE_TOKENS = [
  "ROWNUM",
  "CONNECT BY",
  "SYSDATE",
  "DUAL",
  "NVL",
  "TO_DATE",
  "TO_CHAR",
  "MONTHS_BETWEEN",
  "ADD_MONTHS",
  "EXTRACT(",
  "FETCH FIRST",
  "NEXTVAL",
  "CURRVAL",
  "DECODE",
  "VARCHAR2",
  "MINUS",
];

const DEFAULT_SQL =
  "-- Napíš dopyt a stlač Spustiť (Ctrl/Cmd + Enter).\n-- Tip: SQLite používa LIMIT a strftime() namiesto FETCH FIRST / EXTRACT.\nSELECT m.n_mesta,\n  COUNT(CASE WHEN NOT EXISTS (\n    SELECT 1 FROM p_zamestnanec z\n    WHERE z.rod_cislo = o.rod_cislo AND z.dat_do IS NULL\n  ) THEN 1 END) AS pocet_nezamestnanych\nFROM p_mesto m\nLEFT JOIN p_osoba o ON o.PSC = m.PSC\nGROUP BY m.n_mesta\nORDER BY pocet_nezamestnanych DESC;";

export default function Sandbox() {
  const { ready, loadError, run, reset } = useSqlDb();
  const [sql, setSql] = useLocalStorage<string>("sql-learner:sandbox:sql", DEFAULT_SQL);
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);

  const oracleHits = useMemo(() => {
    const upper = sql.toUpperCase();
    return ORACLE_TOKENS.filter((t) => upper.includes(t));
  }, [sql]);

  const execute = () => setOutcome(run(sql));

  const resetDb = () => {
    reset();
    setOutcome({ results: [], rowsModified: 0 });
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      execute();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SQL sandbox</h1>
          <p className="mt-1 text-slate-600">
            Živé SQL priamo v prehliadači nad schémou sociálnej poisťovne (beží na
            SQLite / sql.js). Oracle-špecifická syntax je označená zvlášť — tu sa
            nevykoná.
          </p>
        </div>
        <Badge tone={ready ? "green" : "amber"}>{ready ? "engine pripravený" : "načítava sa engine…"}</Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr,320px]">
        <div className="space-y-4">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
              <span className="text-xs font-medium text-slate-500">query.sql</span>
              <div className="flex gap-2">
                <button
                  onClick={resetDb}
                  className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  title="Zahodiť a znova naplniť vzorovú databázu"
                >
                  Reset dát
                </button>
                <button
                  onClick={execute}
                  disabled={!ready}
                  className="rounded-md bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  Spustiť ▸
                </button>
              </div>
            </div>
            <textarea
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              onKeyDown={onKey}
              spellCheck={false}
              className="scroll-thin h-64 w-full resize-y bg-slate-900 p-3 font-mono text-[13px] leading-relaxed text-slate-100 focus:outline-none"
            />
          </Card>

          {oracleHits.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <strong>Zistená Oracle-only syntax:</strong> {oracleHits.join(", ")}.
              Tieto bežia na skutočnej Oracle DB, no nie v tomto SQLite sandboxe.
              Pozri príslušnú lekciu pre Oracle tvar.
            </div>
          )}

          {loadError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              Nepodarilo sa načítať SQL engine: {loadError}
            </div>
          )}

          <ResultPanel outcome={outcome} />
        </div>

        <aside className="space-y-4">
          <Card>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Príklady dopytov
            </h2>
            <ul className="space-y-1.5">
              {SANDBOX_EXAMPLES.map((ex) => (
                <li key={ex.label}>
                  <button
                    onClick={() => setSql(ex.sql)}
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {ex.label}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Schéma
            </h2>
            <a
              href="/era-model-soc-poistovne.png"
              target="_blank"
              rel="noopener noreferrer"
              className="group mb-3 block overflow-hidden rounded-lg border border-slate-200 transition hover:border-brand-300"
              title="Otvoriť ERA model v plnej veľkosti"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/era-model-soc-poistovne.png"
                alt="ERA model schémy sociálnej poisťovne"
                className="w-full bg-white"
              />
              <span className="block bg-slate-50 px-2 py-1.5 text-center text-xs text-slate-500 group-hover:text-brand-700">
                🗺️ ERA model sociálnej poisťovne — klikni pre plnú veľkosť
              </span>
            </a>
            <div className="space-y-3">
              {SANDBOX_TABLES.map((t) => (
                <details key={t.name} className="group">
                  <summary className="cursor-pointer list-none text-sm font-medium text-slate-800">
                    <span className="text-brand-700">▸</span> {t.name}
                    <span className="ml-1 font-normal text-slate-400">— {t.description}</span>
                  </summary>
                  <pre className="scroll-thin mt-1 overflow-x-auto rounded-md bg-slate-50 p-2 text-[11px] leading-snug text-slate-600">
                    {t.ddl}
                  </pre>
                </details>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ResultPanel({ outcome }: { outcome: RunOutcome | null }) {
  if (!outcome) {
    return (
      <Card className="text-sm text-slate-400">
        Spusti dopyt a výsledky sa zobrazia tu.
      </Card>
    );
  }
  if (outcome.error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 font-mono text-sm text-rose-700">
        {outcome.error}
      </div>
    );
  }
  if (outcome.results.length === 0) {
    return (
      <Card className="text-sm text-emerald-700">
        Príkaz vykonaný.
        {typeof outcome.rowsModified === "number" && outcome.rowsModified > 0
          ? ` Ovplyvnených riadkov: ${outcome.rowsModified}.`
          : " Nevrátili sa žiadne riadky."}
      </Card>
    );
  }
  return (
    <div className="space-y-4">
      {outcome.results.map((res, i) => (
        <Card key={i} className="p-0">
          <div className="border-b border-slate-200 px-3 py-1.5 text-xs text-slate-500">
            Výsledok {outcome.results.length > 1 ? i + 1 : ""} · riadkov: {res.rows.length}
          </div>
          <div className="scroll-thin overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  {res.columns.map((c) => (
                    <th key={c} className="border-b border-slate-200 px-3 py-2 font-semibold text-slate-700">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {res.rows.map((row, r) => (
                  <tr key={r} className="odd:bg-white even:bg-slate-50/60">
                    {row.map((cell, c) => (
                      <td key={c} className="border-b border-slate-100 px-3 py-1.5 font-mono text-[13px] text-slate-700">
                        {cell === null ? <span className="text-slate-300">NULL</span> : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
