"use client";

import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { TOPICS, topicTitle } from "@/data/topics";
import { LESSONS } from "@/data/lessons";
import { useProgress } from "@/lib/progress";

export default function LessonsIndex() {
  const { state, hydrated } = useProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lekcie</h1>
        <p className="mt-1 text-slate-600">
          Teória a Oracle-špecifická syntax ku každej skúškovej téme. Úryvky len
          pre Oracle sú označené tam, kde sa líšia od SQLite sandboxu.
        </p>
      </div>

      {TOPICS.map((topic) => {
        const lessons = LESSONS.filter((l) => l.topic === topic.id);
        if (lessons.length === 0) return null;
        return (
          <section key={topic.id}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {topic.title}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {lessons.map((l) => {
                const done = hydrated && state.completedLessons.includes(l.id);
                return (
                  <Link key={l.id} href={`/lessons/${l.id}`}>
                    <Card className="h-full transition hover:border-brand-300 hover:shadow">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-slate-900">{l.title}</h3>
                        {done && <Badge tone="green">hotovo</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{l.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {l.keyPoints.slice(0, 1).map((k) => (
                          <span key={k} className="text-xs text-slate-400">
                            {k}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
