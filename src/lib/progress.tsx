"use client";

import { createContext, useContext, useMemo, useCallback, ReactNode } from "react";
import { useLocalStorage } from "./storage";
import type { ProgressState, QuizScore, TopicId } from "@/types";
import { TOPICS } from "@/data/topics";

const EMPTY: ProgressState = {
  topicStats: {},
  questionResults: {},
  flashcardResults: {},
  quizScores: [],
  completedLessons: [],
};

interface ProgressApi {
  state: ProgressState;
  hydrated: boolean;
  recordQuestion: (topic: TopicId, questionId: string, correct: boolean) => void;
  recordFlashcard: (topic: TopicId, cardId: string, known: boolean) => void;
  recordQuizScore: (score: QuizScore) => void;
  toggleLesson: (lessonId: string) => void;
  reset: () => void;
  /** Topics ordered worst-first by accuracy (min attempts considered). */
  weakSpots: () => { topic: TopicId; accuracy: number; attempts: number }[];
}

const Ctx = createContext<ProgressApi | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState, hydrated] = useLocalStorage<ProgressState>(
    "sql-learner:progress:v1",
    EMPTY,
  );

  const recordQuestion = useCallback(
    (topic: TopicId, questionId: string, correct: boolean) => {
      setState((prev) => {
        const stat = prev.topicStats[topic] ?? { attempts: 0, correct: 0 };
        return {
          ...prev,
          topicStats: {
            ...prev.topicStats,
            [topic]: {
              attempts: stat.attempts + 1,
              correct: stat.correct + (correct ? 1 : 0),
            },
          },
          questionResults: {
            ...prev.questionResults,
            [questionId]: { correct, ts: Date.now() },
          },
        };
      });
    },
    [setState],
  );

  const recordFlashcard = useCallback(
    (topic: TopicId, cardId: string, known: boolean) => {
      setState((prev) => {
        const r = prev.flashcardResults[cardId] ?? { known: 0, unknown: 0 };
        return {
          ...prev,
          flashcardResults: {
            ...prev.flashcardResults,
            [cardId]: {
              known: r.known + (known ? 1 : 0),
              unknown: r.unknown + (known ? 0 : 1),
            },
          },
        };
      });
    },
    [setState],
  );

  const recordQuizScore = useCallback(
    (score: QuizScore) => {
      setState((prev) => ({
        ...prev,
        quizScores: [score, ...prev.quizScores].slice(0, 50),
      }));
    },
    [setState],
  );

  const toggleLesson = useCallback(
    (lessonId: string) => {
      setState((prev) => {
        const has = prev.completedLessons.includes(lessonId);
        return {
          ...prev,
          completedLessons: has
            ? prev.completedLessons.filter((l) => l !== lessonId)
            : [...prev.completedLessons, lessonId],
        };
      });
    },
    [setState],
  );

  const reset = useCallback(() => setState(EMPTY), [setState]);

  const weakSpots = useCallback(() => {
    return TOPICS.map((t) => {
      const stat = state.topicStats[t.id];
      const attempts = stat?.attempts ?? 0;
      const accuracy = attempts > 0 ? (stat!.correct / attempts) : 1;
      return { topic: t.id, accuracy, attempts };
    })
      .filter((t) => t.attempts > 0)
      .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
  }, [state.topicStats]);

  const api = useMemo<ProgressApi>(
    () => ({
      state,
      hydrated,
      recordQuestion,
      recordFlashcard,
      recordQuizScore,
      toggleLesson,
      reset,
      weakSpots,
    }),
    [state, hydrated, recordQuestion, recordFlashcard, recordQuizScore, toggleLesson, reset, weakSpots],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}

/**
 * Weight used to bias question selection toward weak topics. A topic answered
 * poorly gets a higher weight so it surfaces more often in "smart" practice.
 */
export function topicWeight(state: ProgressState, topic: TopicId): number {
  const stat = state.topicStats[topic];
  if (!stat || stat.attempts === 0) return 1; // unseen topics: neutral weight
  const accuracy = stat.correct / stat.attempts;
  // accuracy 0 -> weight 4, accuracy 1 -> weight 1
  return 1 + (1 - accuracy) * 3;
}
