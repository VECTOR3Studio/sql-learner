"use client";

import Link from "next/link";
import { Card, Badge, ProgressBar, ButtonLink } from "@/components/ui";
import { useProgress } from "@/lib/progress";
import { TOPICS, topicTitle } from "@/data/topics";

export default function ProgressPage() {
  const { state, hydrated, weakSpots, reset } = useProgress();
  const weak = weakSpots();

  const totalAttempts = Object.values(state.topicStats).reduce((s, t) => s + t.attempts, 0);
  const totalCorrect = Object.values(state.topicStats).reduce((s, t) => s + t.correct, 0);
  const overall = totalAttempts ? totalCorrect / totalAttempts : 0;

  const fcKnown = Object.values(state.flashcardResults).reduce((s, r) => s + r.known, 0);
  const fcUnknown = Object.values(state.flashcardResults).reduce((s, r) => s + r.unknown, 0);

  if (!hydrated) {
    return <div className="text-slate-400">Načítava sa tvoj postup…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Slabé miesta a postup</h1>
          <p className="mt-1 text-slate-600">
            Všetko uložené lokálne v prehliadači. Slabé témy sa častejšie objavujú
            v kvíze „podľa slabých miest“.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm("Vymazať celý uložený postup? Túto akciu nemožno vrátiť späť.")) reset();
          }}
          className="rounded-lg border border-rose-300 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
        >
          Vynulovať postup
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-xs uppercase tracking-wide text-slate-400">Celková úspešnosť</div>
          <div className="mt-1 text-3xl font-bold text-slate-900">
            {totalAttempts ? Math.round(overall * 100) : 0}%
          </div>
          <div className="mt-2">
            <ProgressBar value={overall} />
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {totalCorrect}/{totalAttempts} odpovedí
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wide text-slate-400">Absolvované kvízy</div>
          <div className="mt-1 text-3xl font-bold text-slate-900">{state.quizScores.length}</div>
          <div className="mt-2 text-xs text-slate-500">
            {state.quizScores[0]
              ? `posledný: ${state.quizScores[0].correct}/${state.quizScores[0].total}`
              : "zatiaľ žiadny kvíz"}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wide text-slate-400">Ohodnotené kartičky</div>
          <div className="mt-1 text-3xl font-bold text-slate-900">{fcKnown + fcUnknown}</div>
          <div className="mt-2 text-xs text-slate-500">
            vedel {fcKnown} · zopakovať {fcUnknown}
          </div>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Slabé miesta</h2>
            <ButtonLink href="/quiz?mode=weak" variant="ghost">
              Precvičiť ich →
            </ButtonLink>
          </div>
          {weak.length === 0 ? (
            <p className="text-sm text-slate-500">
              Absolvuj kvíz a toto sa naplní. Témy, v ktorých chybuješ, sa tu zoradia.
            </p>
          ) : (
            <ol className="space-y-3">
              {weak.map((w, i) => (
                <li key={w.topic} className="grid grid-cols-[auto,1fr,auto] items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-sm text-slate-700">{topicTitle(w.topic)}</span>
                    <div className="mt-1">
                      <ProgressBar value={w.accuracy} />
                    </div>
                  </div>
                  <Badge tone={w.accuracy < 0.5 ? "red" : "amber"}>
                    {Math.round(w.accuracy * 100)}%
                  </Badge>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-lg font-semibold">Všetky témy</h2>
          <ul className="space-y-2.5">
            {TOPICS.map((t) => {
              const stat = state.topicStats[t.id];
              const acc = stat && stat.attempts ? stat.correct / stat.attempts : 0;
              return (
                <li key={t.id} className="grid grid-cols-[1fr,auto] items-center gap-3">
                  <div>
                    <Link href={`/quiz`} className="text-sm text-slate-700 hover:text-brand-700">
                      {t.title}
                    </Link>
                    <div className="mt-1">
                      <ProgressBar value={acc} />
                    </div>
                  </div>
                  <span className="text-xs tabular-nums text-slate-500">
                    {stat ? `${stat.correct}/${stat.attempts}` : "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-lg font-semibold">Posledné kvízy</h2>
        {state.quizScores.length === 0 ? (
          <p className="text-sm text-slate-500">Zatiaľ žiadny zaznamenaný kvíz.</p>
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2 pr-4 font-medium">Kedy</th>
                  <th className="py-2 pr-4 font-medium">Skóre</th>
                  <th className="py-2 pr-4 font-medium">Režim</th>
                  <th className="py-2 pr-4 font-medium">Témy</th>
                  <th className="py-2 font-medium">Trvanie</th>
                </tr>
              </thead>
              <tbody>
                {state.quizScores.map((q, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-2 pr-4 text-slate-600">{new Date(q.ts).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <Badge tone={q.correct / q.total >= 0.7 ? "green" : q.correct / q.total >= 0.4 ? "amber" : "red"}>
                        {q.correct}/{q.total}
                      </Badge>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{q.mode === "timed" ? "na čas" : "bez času"}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {q.topics === "all" ? "všetky" : q.topics.map(topicTitle).join(", ")}
                    </td>
                    <td className="py-2 text-slate-600">{Math.round(q.durationMs / 1000)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
