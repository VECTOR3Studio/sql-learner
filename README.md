# Oracle SQL Exam Prep

A study app (UI in Slovak) for a university-level Oracle SQL final, pre-loaded
from your exam materials: the **social-insurance schema** (`p_*` tables), the
multiple-choice answer keys, and the theory blocks (ACID, BCNF / functional
dependencies, ER cardinality, triggers, sequences, transactions, relational
algebra).

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**. All progress is
saved in **localStorage** — no backend.

## Run it

```bash
npm install      # also copies the sql.js wasm into /public (postinstall)
npm run dev      # http://localhost:3000
# or
npm run build && npm run start
```

> If `public/sql-wasm.wasm` is ever missing, run `node scripts/copy-sql-wasm.mjs`.

## Features

- **Lessons** (`/lessons`) — one per topic: SELECT, joins, subqueries, aggregates,
  DDL, DML, constraints, views, sequences, functions/dates, PL/SQL, transactions,
  normalization, ER modeling, integrity, relational algebra. Oracle-only syntax is
  badged where it differs from the sandbox.
- **SQL sandbox** (`/sandbox`) — a live in-browser SQL editor (SQLite via
  `sql.js`) seeded with the **social-insurance schema** (`p_krajina`, `p_kraj`,
  `p_okres`, `p_mesto`, `p_osoba`, `p_zamestnavatel`, `p_zamestnanec`,
  `p_platitel`, `p_poistenie`, `p_poberatel`, `p_typ_prispevku`, `p_prispevky`,
  `p_historia`, `p_odvod_platba`, `p_ZTP`, `p_typ_postihnutia`). Oracle-specific
  tokens (`ROWNUM`, `SYSDATE`, `FETCH FIRST`, …) are flagged because they won't
  run in SQLite. Press **Ctrl/Cmd+Enter** to run. Validate the schema with
  `node --experimental-strip-types scripts/check-sandbox.mts`.
- **Practical questions** (`/practice`) — exam-style "write the SQL / PL-SQL"
  tasks grouped by category (SELECT, DML, DDL & constraints, PL/SQL blocks,
  triggers, procedures & functions). Each task hides its solution behind a
  **Show solution** toggle; runnable SELECT solutions have an **Open in sandbox**
  button (and every solution can be copied).
- **Quiz** (`/quiz`) — exam-style multiple-choice + written questions parsed from
  the materials. Choose topics, length (5/10/20), timed or untimed, and a
  weak-spot bias that oversamples topics you miss. Written answers are loosely
  keyword-graded with the model answer always shown.
- **Flashcards** (`/flashcards`) — term/concept review per topic with self-grading.
- **Weak spots** (`/progress`) — accuracy per topic, ranked weak spots, quiz
  history, and flashcard stats. Feeds the "weak-spot bias" quiz mode.

## Where the content lives

| File | Contents |
| --- | --- |
| `src/data/topics.ts` | Topic list |
| `src/data/lessons.ts` | Lesson theory + Oracle syntax |
| `src/data/questions.ts` | Quiz questions (MCQ + written), answer keys |
| `src/data/practicals.ts` | Practical SQL / PL-SQL writing tasks + solutions |
| `src/data/flashcards.ts` | Flashcards |
| `src/data/sandbox.ts` | SQLite schema, seed rows, example queries |

Add or edit entries in those files to extend the app — the UI picks them up
automatically.

## Notes on Oracle vs the sandbox

The sandbox runs **SQLite**, so a few things differ from Oracle (covered in the
lessons): use `LIMIT` instead of `FETCH FIRST`/`ROWNUM`, and `strftime('%Y', d)`
instead of `EXTRACT(YEAR FROM d)` / `TO_CHAR(d,'YYYY')`. PL/SQL (procedures,
functions, triggers, cursors), sequences, and `WITH CHECK OPTION` are Oracle-only
and are shown as display-only examples. Practical tasks present the Oracle/exam
solution; runnable SELECT tasks also carry a SQLite-compatible variant used by the
"Open in sandbox" button.
