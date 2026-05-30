"use client";

import Link from "next/link";
import { Card, Badge, ButtonLink, ProgressBar } from "@/components/ui";
import { useProgress } from "@/lib/progress";
import { TOPICS, topicTitle } from "@/data/topics";
import { LESSONS } from "@/data/lessons";
import { QUESTIONS } from "@/data/questions";
import { FLASHCARDS } from "@/data/flashcards";

const FOCUS = [
  "joins",
  "subqueries",
  "aggregates",
  "ddl",
  "dml",
  "constraints",
  "views",
  "sequences",
  "plsql",
];

export default function Dashboard() {
  const { state, hydrated, weakSpots } = useProgress();
  const weak = weakSpots();

  const lessonsDone = state.completedLessons.length;
  const quizAttempts = Object.keys(state.questionResults).length;
  const lastQuiz = state.quizScores[0];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-7 text-white shadow">
        <h1 className="text-2xl font-bold">Príprava na skúšku z Oracle SQL</h1>
        <p className="mt-1 max-w-2xl text-brand-50">
          Všetko nižšie je predpripravené z tvojich skúškových materiálov — schéma
          sociálnej poisťovne, kľúče k otázkam s výberom odpovede a teoretické
          bloky (ACID, BCNF, funkčné závislosti, ERA kardinalita, triggre,
          sekvencie). Precvičuj a nechaj sledovanie slabých miest tlačiť témy,
          v ktorých chybuješ.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/quiz">Spustiť kvíz</ButtonLink>
          <Link
            href="/sandbox"
            className="inline-flex items-center rounded-lg bg-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/25"
          >
            Otvoriť SQL sandbox
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Lekcie" value={`${lessonsDone}/${LESSONS.length}`} sub="dokončené" href="/lessons" />
        <Stat label="Videné otázky" value={`${quizAttempts}/${QUESTIONS.length}`} sub="aspoň raz zodpovedané" href="/quiz" />
        <Stat label="Kartičky" value={`${FLASHCARDS.length}`} sub="pojmy a koncepty" href="/flashcards" />
        <Stat
          label="Posledný kvíz"
          value={lastQuiz ? `${lastQuiz.correct}/${lastQuiz.total}` : "—"}
          sub={lastQuiz ? new Date(lastQuiz.ts).toLocaleDateString() : "zatiaľ žiadny pokus"}
          href="/progress"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Pokrytie tém</h2>
            <Badge tone="brand">{TOPICS.length} tém</Badge>
          </div>
          <ul className="space-y-3">
            {TOPICS.map((t) => {
              const stat = state.topicStats[t.id];
              const acc = stat && stat.attempts ? stat.correct / stat.attempts : 0;
              return (
                <li key={t.id} className="grid grid-cols-[1fr,auto] items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">{t.title}</span>
                      {FOCUS.includes(t.id) && <Badge tone="amber">priorita</Badge>}
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={acc} />
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-slate-500">
                    {hydrated && stat ? `${stat.correct}/${stat.attempts}` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Tvoje slabé miesta</h2>
          {!hydrated ? (
            <p className="text-sm text-slate-400">Načítava sa…</p>
          ) : weak.length === 0 ? (
            <p className="text-sm text-slate-500">
              Odpovedz na pár otázok v kvíze a témy, v ktorých najviac chybuješ, sa
              tu zobrazia — a dostanú prioritu v „cielenom precvičovaní“.
            </p>
          ) : (
            <ol className="space-y-2">
              {weak.slice(0, 6).map((w, i) => (
                <li key={w.topic} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-rose-100 text-[11px] font-bold text-rose-700">
                      {i + 1}
                    </span>
                    {topicTitle(w.topic)}
                  </span>
                  <Badge tone={w.accuracy < 0.5 ? "red" : "amber"}>
                    {Math.round(w.accuracy * 100)}%
                  </Badge>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-4">
            <ButtonLink href="/quiz?mode=weak" variant="ghost">
              Precvičiť slabé miesta →
            </ButtonLink>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition hover:border-brand-300 hover:shadow">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
        <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-500">{sub}</div>
      </Card>
    </Link>
  );
}
