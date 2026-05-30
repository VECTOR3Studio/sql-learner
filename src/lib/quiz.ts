import type { ProgressState, QuizQuestion, TopicId } from "@/types";
import { topicWeight } from "./progress";

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface SelectOpts {
  pool: QuizQuestion[];
  topics: TopicId[] | "all";
  count: number;
  /** bias selection toward weak topics using progress weights. */
  weighted: boolean;
  state: ProgressState;
}

/**
 * Pick `count` questions. With weighting, topics answered poorly are oversampled
 * (a weak topic's questions are duplicated proportionally, then we draw uniques).
 */
export function selectQuestions({ pool, topics, count, weighted, state }: SelectOpts): QuizQuestion[] {
  let candidates = topics === "all" ? pool : pool.filter((q) => topics.includes(q.topic));
  if (candidates.length === 0) candidates = pool;

  if (!weighted) {
    return shuffle(candidates).slice(0, Math.min(count, candidates.length));
  }

  // Build a weighted bag, then draw uniques.
  const bag: QuizQuestion[] = [];
  for (const q of candidates) {
    const w = Math.max(1, Math.round(topicWeight(state, q.topic)));
    for (let i = 0; i < w; i++) bag.push(q);
  }
  const picked: QuizQuestion[] = [];
  const seen = new Set<string>();
  for (const q of shuffle(bag)) {
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    picked.push(q);
    if (picked.length >= Math.min(count, candidates.length)) break;
  }
  return picked;
}

/** Normalize text for loose matching of written answers. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Grade a written answer by counting how many keywords appear. Returns a ratio
 * and a boolean "pass" (>= 60% of keywords present). This is a study aid, not a
 * strict grader — the model answer is always shown for self-assessment.
 */
export function gradeWritten(answer: string, keywords: string[] = []): { ratio: number; pass: boolean; hits: string[] } {
  if (keywords.length === 0) {
    const pass = norm(answer).length > 0;
    return { ratio: pass ? 1 : 0, pass, hits: [] };
  }
  const a = norm(answer);
  const hits = keywords.filter((k) => a.includes(norm(k)));
  const ratio = hits.length / keywords.length;
  return { ratio, pass: ratio >= 0.6, hits };
}

export function isCorrectMcq(selected: number[], correct: number[] = []): boolean {
  if (selected.length !== correct.length) return false;
  const c = new Set(correct);
  return selected.every((s) => c.has(s));
}
