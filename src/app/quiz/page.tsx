"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Badge, CodeBlock, ProgressBar } from "@/components/ui";
import { TOPICS, topicTitle } from "@/data/topics";
import { QUESTIONS } from "@/data/questions";
import type { QuizQuestion, TopicId } from "@/types";
import { useProgress } from "@/lib/progress";
import { selectQuestions, gradeWritten, isCorrectMcq } from "@/lib/quiz";

type Phase = "setup" | "active" | "done";

interface Answer {
  question: QuizQuestion;
  selected: number[]; // mcq
  text: string; // written
  correct: boolean;
}

function QuizInner() {
  const search = useSearchParams();
  const { state, recordQuestion, recordQuizScore } = useProgress();

  const [phase, setPhase] = useState<Phase>("setup");
  const [picked, setPicked] = useState<TopicId[]>([]);
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);
  const [smart, setSmart] = useState(search.get("mode") === "weak");

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [sel, setSel] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [revealed, setRevealed] = useState(false);

  const startedAt = useRef<number>(0);
  const [remaining, setRemaining] = useState<number>(0);

  // preselect weak mode from URL
  useEffect(() => {
    if (search.get("mode") === "weak") setSmart(true);
  }, [search]);

  // countdown timer
  useEffect(() => {
    if (phase !== "active" || !timed) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timed]);

  const toggleTopic = (t: TopicId) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  const begin = () => {
    const qs = selectQuestions({
      pool: QUESTIONS,
      topics: picked.length ? picked : "all",
      count,
      weighted: smart,
      state,
    });
    if (qs.length === 0) return;
    setQuestions(qs);
    setIdx(0);
    setAnswers([]);
    setSel([]);
    setText("");
    setRevealed(false);
    startedAt.current = Date.now();
    setRemaining(qs.length * 60); // 60s per question budget when timed
    setPhase("active");
  };

  const current = questions[idx];

  const submit = () => {
    if (!current || revealed) return;
    let correct = false;
    if (current.kind === "mcq") {
      correct = isCorrectMcq(sel, current.correct);
    } else {
      correct = gradeWritten(text, current.keywords).pass;
    }
    recordQuestion(current.topic, current.id, correct);
    setAnswers((a) => [...a, { question: current, selected: sel, text, correct }]);
    setRevealed(true);
  };

  const nextQuestion = () => {
    if (idx + 1 >= questions.length) {
      finish();
      return;
    }
    setIdx((i) => i + 1);
    setSel([]);
    setText("");
    setRevealed(false);
  };

  const finish = () => {
    setPhase("done");
  };

  // record score once when entering done
  const recorded = useRef(false);
  useEffect(() => {
    if (phase === "done" && !recorded.current && questions.length > 0) {
      recorded.current = true;
      const correct = answers.filter((a) => a.correct).length;
      recordQuizScore({
        ts: Date.now(),
        total: questions.length,
        correct,
        topics: picked.length ? picked : "all",
        durationMs: Date.now() - startedAt.current,
        mode: timed ? "timed" : "untimed",
      });
    }
    if (phase !== "done") recorded.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === "setup") {
    return (
      <Setup
        picked={picked}
        toggleTopic={toggleTopic}
        count={count}
        setCount={setCount}
        timed={timed}
        setTimed={setTimed}
        smart={smart}
        setSmart={setSmart}
        begin={begin}
      />
    );
  }

  if (phase === "done") {
    return <Summary answers={answers} restart={() => setPhase("setup")} />;
  }

  // active
  const grade = current.kind === "written" ? gradeWritten(text, current.keywords) : null;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>
            Otázka {idx + 1} / {questions.length}
          </span>
          <Badge tone="brand">{topicTitle(current.topic)}</Badge>
          <Badge tone={current.kind === "mcq" ? "slate" : "amber"}>
            {current.kind === "mcq" ? "výber odpovede" : "písomná"}
          </Badge>
        </div>
        {timed && (
          <Badge tone={remaining < 30 ? "red" : "slate"}>
            ⏱ {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </Badge>
        )}
      </div>
      <ProgressBar value={idx / questions.length} />

      <Card>
        <p className="font-medium text-slate-900">{current.prompt}</p>
        {current.code && (
          <div className="mt-3">
            <CodeBlock code={current.code} />
          </div>
        )}

        {current.kind === "mcq" ? (
          <ul className="mt-4 space-y-2">
            {current.choices!.map((choice, i) => {
              const chosen = sel.includes(i);
              const isCorrect = current.correct?.includes(i);
              let cls = "border-slate-200 hover:border-brand-300";
              if (revealed) {
                if (isCorrect) cls = "border-emerald-400 bg-emerald-50";
                else if (chosen) cls = "border-rose-400 bg-rose-50";
                else cls = "border-slate-200 opacity-70";
              } else if (chosen) {
                cls = "border-brand-500 bg-brand-50";
              }
              return (
                <li key={i}>
                  <button
                    disabled={revealed}
                    onClick={() =>
                      setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]))
                    }
                    className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-current text-[11px] font-bold text-slate-500">
                      {String.fromCharCode(97 + i)}
                    </span>
                    <span className="text-slate-800">{choice}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={revealed}
              placeholder="Napíš odpoveď (SQL alebo text)…"
              className="scroll-thin h-32 w-full resize-y rounded-lg border border-slate-300 p-3 font-mono text-sm focus:border-brand-400 focus:outline-none"
            />
            {revealed && grade && (
              <p className="mt-2 text-sm text-slate-600">
                Zhoda kľúčových slov: {grade.hits.length}/{current.keywords?.length ?? 0}{" "}
                {grade.pass ? (
                  <Badge tone="green">vyzerá dobre</Badge>
                ) : (
                  <Badge tone="amber">porovnaj so vzorovou odpoveďou</Badge>
                )}
              </p>
            )}
          </div>
        )}

        {revealed && (
          <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-3 text-sm">
            {current.kind === "written" && current.modelAnswer && (
              <div>
                <div className="font-semibold text-slate-700">Vzorová odpoveď</div>
                <p className="mt-1 whitespace-pre-wrap text-slate-600">{current.modelAnswer}</p>
              </div>
            )}
            {current.explanation && (
              <p className="text-slate-600">
                <span className="font-semibold text-slate-700">Prečo: </span>
                {current.explanation}
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-end gap-2">
        {!revealed ? (
          <button
            onClick={submit}
            disabled={current.kind === "mcq" ? sel.length === 0 : text.trim() === ""}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {current.kind === "written" ? "Zobraziť vzorovú odpoveď" : "Vyhodnotiť"}
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {idx + 1 >= questions.length ? "Ukončiť" : "Ďalšia otázka →"}
          </button>
        )}
      </div>
    </div>
  );
}

function Setup({
  picked,
  toggleTopic,
  count,
  setCount,
  timed,
  setTimed,
  smart,
  setSmart,
  begin,
}: {
  picked: TopicId[];
  toggleTopic: (t: TopicId) => void;
  count: number;
  setCount: (n: number) => void;
  timed: boolean;
  setTimed: (b: boolean) => void;
  smart: boolean;
  setSmart: (b: boolean) => void;
  begin: () => void;
}) {
  const available = useMemo(() => {
    const topicCounts: Record<string, number> = {};
    QUESTIONS.forEach((q) => (topicCounts[q.topic] = (topicCounts[q.topic] ?? 0) + 1));
    return topicCounts;
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Skúškový kvíz</h1>
        <p className="mt-1 text-slate-600">
          {QUESTIONS.length} otázok spracovaných z tvojich materiálov — s výberom
          odpovede aj písomné. Vyber témy alebo nechaj prázdne pre všetky.
        </p>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Témy {picked.length > 0 && `(${picked.length} vybraných)`}
        </h2>
        <div className="flex flex-wrap gap-2">
          {TOPICS.filter((t) => available[t.id]).map((t) => {
            const on = picked.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggleTopic(t.id)}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  on
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {t.title}
                <span className="ml-1.5 text-xs text-slate-400">{available[t.id]}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <label className="text-sm font-medium text-slate-700">Počet otázok</label>
          <div className="mt-2 flex gap-2">
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                  count === n
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <label className="text-sm font-medium text-slate-700">Čas</label>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setTimed(false)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                !timed ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Bez času
            </button>
            <button
              onClick={() => setTimed(true)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                timed ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Na čas (1 min/otázka)
            </button>
          </div>
        </Card>
        <Card>
          <label className="text-sm font-medium text-slate-700">Výber otázok</label>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setSmart(false)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                !smart ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Náhodne
            </button>
            <button
              onClick={() => setSmart(true)}
              className={`flex-1 rounded-lg border px-2 py-2 text-sm font-medium transition ${
                smart ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Podľa slabých miest
            </button>
          </div>
        </Card>
      </div>

      <button
        onClick={begin}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Spustiť kvíz →
      </button>
    </div>
  );
}

function Summary({ answers, restart }: { answers: Answer[]; restart: () => void }) {
  const correct = answers.filter((a) => a.correct).length;
  const pct = answers.length ? Math.round((correct / answers.length) * 100) : 0;

  const byTopic: Record<string, { c: number; t: number }> = {};
  answers.forEach((a) => {
    const k = a.question.topic;
    byTopic[k] = byTopic[k] ?? { c: 0, t: 0 };
    byTopic[k].t++;
    if (a.correct) byTopic[k].c++;
  });

  return (
    <div className="space-y-5">
      <Card className="text-center">
        <div className="text-5xl font-bold text-slate-900">{pct}%</div>
        <p className="mt-1 text-slate-600">
          {correct} z {answers.length} správne
        </p>
        <div className="mx-auto mt-3 max-w-xs">
          <ProgressBar value={answers.length ? correct / answers.length : 0} />
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <button onClick={restart} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Nový kvíz
          </button>
          <Link href="/progress" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">
            Zobraziť postup
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Podľa tém</h2>
        <ul className="space-y-2">
          {Object.entries(byTopic).map(([t, v]) => (
            <li key={t} className="grid grid-cols-[1fr,auto] items-center gap-3">
              <div>
                <span className="text-sm text-slate-700">{topicTitle(t)}</span>
                <div className="mt-1">
                  <ProgressBar value={v.c / v.t} />
                </div>
              </div>
              <span className="text-xs tabular-nums text-slate-500">
                {v.c}/{v.t}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Prehľad otázok</h2>
        <ol className="space-y-2">
          {answers.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className={a.correct ? "text-emerald-600" : "text-rose-600"}>
                {a.correct ? "✓" : "✕"}
              </span>
              <span className="text-slate-700">{a.question.prompt}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="text-slate-400">Načítava sa…</div>}>
      <QuizInner />
    </Suspense>
  );
}
