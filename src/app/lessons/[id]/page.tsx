"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Badge, CodeBlock } from "@/components/ui";
import { LESSON_MAP, LESSONS } from "@/data/lessons";
import { topicTitle } from "@/data/topics";
import { useProgress } from "@/lib/progress";

export default function LessonDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const lesson = LESSON_MAP[params.id];
  const { state, hydrated, toggleLesson } = useProgress();

  if (!lesson) {
    return (
      <div className="space-y-4">
        <p className="text-slate-600">Lekcia sa nenašla.</p>
        <Link href="/lessons" className="text-brand-700 underline">
          ← Späť na lekcie
        </Link>
      </div>
    );
  }

  const done = hydrated && state.completedLessons.includes(lesson.id);
  const idx = LESSONS.findIndex((l) => l.id === lesson.id);
  const prev = LESSONS[idx - 1];
  const next = LESSONS[idx + 1];

  return (
    <article className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Link href="/lessons" className="text-sm text-brand-700 hover:underline">
            ← Lekcie
          </Link>
          <span className="text-slate-300">/</span>
          <Badge tone="brand">{topicTitle(lesson.topic)}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{lesson.title}</h1>
        <p className="mt-1 text-slate-600">{lesson.summary}</p>
      </div>

      <Card className="bg-brand-50/40">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-700">
          Kľúčové body
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {lesson.keyPoints.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </Card>

      {lesson.sections.map((s) => (
        <section key={s.heading} className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">{s.heading}</h2>
          <div className="prose-card space-y-2 text-[15px] text-slate-700">
            {s.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {s.code?.map((c, i) => (
            <CodeBlock key={i} code={c.code} label={c.label} oracleOnly={c.oracleOnly} />
          ))}
        </section>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <button
          onClick={() => toggleLesson(lesson.id)}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            done
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-brand-600 text-white hover:bg-brand-700"
          }`}
        >
          {done ? "✓ Dokončené" : "Označiť ako dokončené"}
        </button>
        <div className="flex gap-2">
          {prev && (
            <button
              onClick={() => router.push(`/lessons/${prev.id}`)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              ← {prev.title.split(":")[0]}
            </button>
          )}
          {next && (
            <button
              onClick={() => router.push(`/lessons/${next.id}`)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              {next.title.split(":")[0]} →
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
