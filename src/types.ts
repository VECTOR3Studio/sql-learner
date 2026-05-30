// Shared domain types for the Oracle SQL exam-prep app.

export type TopicId =
  | "select"
  | "joins"
  | "subqueries"
  | "aggregates"
  | "ddl"
  | "dml"
  | "constraints"
  | "views"
  | "sequences"
  | "functions"
  | "plsql"
  | "transactions"
  | "normalization"
  | "er-modeling"
  | "integrity"
  | "relational-algebra";

export interface Topic {
  id: TopicId;
  title: string;
  blurb: string;
}

export interface CodeBlock {
  label?: string;
  /** "sql" runs in the sandbox; "plsql" is Oracle-only (display only). */
  lang: "sql" | "plsql" | "text";
  code: string;
  /** Marks Oracle-specific syntax that will NOT run in the SQLite sandbox. */
  oracleOnly?: boolean;
}

export interface LessonSection {
  heading: string;
  body: string[];
  code?: CodeBlock[];
}

export interface Lesson {
  id: string;
  topic: TopicId;
  title: string;
  summary: string;
  sections: LessonSection[];
  /** Quick facts surfaced at the top of the lesson. */
  keyPoints: string[];
}

export type QuestionKind = "mcq" | "written";

export interface QuizQuestion {
  id: string;
  topic: TopicId;
  kind: QuestionKind;
  prompt: string;
  /** Optional code snippet shown with the prompt. */
  code?: string;
  /** MCQ choices. */
  choices?: string[];
  /** Index/indices of correct choice(s) for MCQ. */
  correct?: number[];
  /** Reference / model answer for written questions. */
  modelAnswer?: string;
  /** Keywords used to auto-grade written answers (loose match). */
  keywords?: string[];
  explanation?: string;
}

export interface Flashcard {
  id: string;
  topic: TopicId;
  front: string;
  back: string;
}

export interface SandboxTable {
  name: string;
  ddl: string;
  /** INSERT statements seeding sample rows. */
  seed: string[];
  description: string;
}

// ---- Persisted progress shapes (localStorage) ----

export interface TopicStat {
  attempts: number;
  correct: number;
}

export interface ProgressState {
  /** per-topic running tallies from quizzes. */
  topicStats: Record<string, TopicStat>;
  /** per-question last result, keyed by question id. */
  questionResults: Record<string, { correct: boolean; ts: number }>;
  /** flashcard self-grades: known/unknown counts. */
  flashcardResults: Record<string, { known: number; unknown: number }>;
  /** finished quiz sessions. */
  quizScores: QuizScore[];
  /** lessons the user marked complete. */
  completedLessons: string[];
}

export interface QuizScore {
  ts: number;
  total: number;
  correct: number;
  topics: TopicId[] | "all";
  durationMs: number;
  mode: "timed" | "untimed";
}
