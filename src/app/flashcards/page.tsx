"use client";

import { useMemo, useState } from "react";
import { Card, Badge } from "@/components/ui";
import { TOPICS, topicTitle } from "@/data/topics";
import { FLASHCARDS } from "@/data/flashcards";
import type { Flashcard, TopicId } from "@/types";
import { useProgress } from "@/lib/progress";
import { shuffle } from "@/lib/quiz";

export default function Flashcards() {
  const { state, recordFlashcard, hydrated } = useProgress();
  const [topic, setTopic] = useState<TopicId | "all">("all");
  const [deck, setDeck] = useState<Flashcard[]>(() => shuffle(FLASHCARDS));
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [session, setSession] = useState({ known: 0, unknown: 0 });

  const topicsWithCards = useMemo(() => {
    const set = new Set(FLASHCARDS.map((f) => f.topic));
    return TOPICS.filter((t) => set.has(t.id));
  }, []);

  const startDeck = (t: TopicId | "all") => {
    setTopic(t);
    const cards = t === "all" ? FLASHCARDS : FLASHCARDS.filter((f) => f.topic === t);
    setDeck(shuffle(cards));
    setI(0);
    setFlipped(false);
    setSession({ known: 0, unknown: 0 });
  };

  const card = deck[i];
  const done = i >= deck.length;

  const grade = (known: boolean) => {
    if (!card) return;
    recordFlashcard(card.topic, card.id, known);
    setSession((s) => ({
      known: s.known + (known ? 1 : 0),
      unknown: s.unknown + (known ? 0 : 1),
    }));
    setFlipped(false);
    setI((x) => x + 1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kartičky</h1>
        <p className="mt-1 text-slate-600">
          {FLASHCARDS.length} pojmov a konceptov. Otoč kartičku a označ, či si to
          vedel — výsledky sa premietnu do tvojej štatistiky.
        </p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => startDeck("all")}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              topic === "all"
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-slate-300 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Všetky ({FLASHCARDS.length})
          </button>
          {topicsWithCards.map((t) => {
            const n = FLASHCARDS.filter((f) => f.topic === t.id).length;
            return (
              <button
                key={t.id}
                onClick={() => startDeck(t.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  topic === t.id
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.title} <span className="text-xs text-slate-400">{n}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {done ? (
        <Card className="text-center">
          <div className="text-2xl font-bold text-slate-900">Balíček hotový 🎉</div>
          <p className="mt-1 text-slate-600">
            Vedel: {session.known} · na zopakovanie: {session.unknown} z {deck.length}
          </p>
          <button
            onClick={() => startDeck(topic)}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Zamiešať & znova
          </button>
        </Card>
      ) : (
        card && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Kartička {i + 1} / {deck.length}
              </span>
              <Badge tone="brand">{topicTitle(card.topic)}</Badge>
            </div>

            <button
              onClick={() => setFlipped((f) => !f)}
              className="grid min-h-[220px] w-full place-items-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition hover:shadow"
            >
              {!flipped ? (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-400">pojem</div>
                  <div className="mt-2 text-2xl font-semibold text-slate-900">{card.front}</div>
                  <div className="mt-4 text-xs text-slate-400">klikni pre otočenie</div>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-brand-500">odpoveď</div>
                  <div className="mt-2 text-lg text-slate-700">{card.back}</div>
                </div>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => grade(false)}
                className="flex-1 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                Treba zopakovať
              </button>
              <button
                onClick={() => grade(true)}
                className="flex-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
              >
                Vedel som to
              </button>
            </div>

            {hydrated && state.flashcardResults[card.id] && (
              <p className="text-center text-xs text-slate-400">
                história: vedel {state.flashcardResults[card.id].known}× · nevedel{" "}
                {state.flashcardResults[card.id].unknown}×
              </p>
            )}
          </div>
        )
      )}
    </div>
  );
}
