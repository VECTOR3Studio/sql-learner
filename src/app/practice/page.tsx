"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Badge, CodeBlock } from "@/components/ui";
import { topicTitle } from "@/data/topics";
import { PRACTICALS, PRACTICAL_CATEGORIES } from "@/data/practicals";
import type { Practical, PracticalCategory } from "@/types";

const SANDBOX_KEY = "sql-learner:sandbox:sql";

export default function PracticePage() {
  const [active, setActive] = useState<PracticalCategory | "all">("all");

  const shown =
    active === "all" ? PRACTICALS : PRACTICALS.filter((p) => p.category === active);

  const visibleCats = PRACTICAL_CATEGORIES.filter(
    (c) => active === "all" || c.id === active,
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Praktické otázky</h1>
        <p className="mt-1 text-slate-600">
          Úlohy na písanie SQL a PL/SQL kódu, ako v materiáloch. Skús úlohu vyriešiť
          sám, potom si rozbaľ riešenie. Spustiteľné SELECT-y vieš otvoriť priamo
          v sandboxe.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Chip on={active === "all"} onClick={() => setActive("all")}>
            Všetky ({PRACTICALS.length})
          </Chip>
          {PRACTICAL_CATEGORIES.map((c) => {
            const n = PRACTICALS.filter((p) => p.category === c.id).length;
            return (
              <Chip key={c.id} on={active === c.id} onClick={() => setActive(c.id)}>
                {c.title} <span className="text-xs text-slate-400">{n}</span>
              </Chip>
            );
          })}
        </div>
      </Card>

      {visibleCats.map((cat) => {
        const items = shown.filter((p) => p.category === cat.id);
        if (items.length === 0) return null;
        return (
          <section key={cat.id} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {cat.title}
            </h2>
            <div className="space-y-3">
              {items.map((p, i) => (
                <PracticalCard key={p.id} item={p} index={i + 1} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        on
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-slate-300 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function PracticalCard({ item, index }: { item: Practical; index: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(item.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const openInSandbox = () => {
    const sql = item.sandbox ?? item.answer;
    try {
      window.localStorage.setItem(SANDBOX_KEY, JSON.stringify(sql));
    } catch {
      /* ignore */
    }
    router.push("/sandbox");
  };

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-slate-900">
          <span className="mr-2 text-slate-400">{index}.</span>
          {item.prompt}
        </p>
        <div className="flex shrink-0 gap-1">
          <Badge tone="brand">{topicTitle(item.topic)}</Badge>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          ▸ Zobraziť riešenie
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-slate-500 hover:text-slate-700"
            >
              ▾ Skryť riešenie
            </button>
            <div className="flex gap-2">
              <button
                onClick={copy}
                className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                {copied ? "Skopírované ✓" : "Kopírovať"}
              </button>
              {item.sandbox && (
                <button
                  onClick={openInSandbox}
                  className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  Otvoriť v sandboxe ▸
                </button>
              )}
            </div>
          </div>
          <CodeBlock
            code={item.answer}
            oracleOnly={item.oracleOnly}
            label={item.answerLang === "plsql" ? "PL/SQL" : "SQL"}
          />
          {item.note && <p className="text-xs text-slate-500">{item.note}</p>}
        </div>
      )}
    </Card>
  );
}
