import type { Topic } from "@/types";

export const TOPICS: Topic[] = [
  { id: "select", title: "SELECT a filtrovanie", blurb: "Projekcia, WHERE, ORDER BY, DISTINCT, FETCH FIRST." },
  { id: "joins", title: "Spojenia (JOIN)", blurb: "INNER / LEFT / RIGHT / FULL, USING vs ON, NATURAL, ANTI / SEMI." },
  { id: "subqueries", title: "Vnorené dopyty", blurb: "IN / NOT IN, EXISTS / NOT EXISTS, korelované, vnorené agregácie." },
  { id: "aggregates", title: "Agregačné funkcie a GROUP BY", blurb: "COUNT/SUM/AVG/MAX/MIN, GROUP BY, HAVING." },
  { id: "ddl", title: "DDL — CREATE / ALTER", blurb: "CREATE / ALTER TABLE, stĺpce, kľúče; DDL automaticky commituje." },
  { id: "dml", title: "DML — INSERT / UPDATE / DELETE", blurb: "INSERT … SELECT, UPDATE … WHERE, DELETE; SQL%ROWCOUNT." },
  { id: "constraints", title: "Obmedzenia (constraints)", blurb: "PRIMARY KEY, FOREIGN KEY, NOT NULL, UNIQUE, CHECK, DEFAULT." },
  { id: "views", title: "Pohľady (views)", blurb: "CREATE VIEW, WITH CHECK OPTION, aktualizovateľné vs read-only." },
  { id: "sequences", title: "Sekvencie", blurb: "CREATE SEQUENCE, NEXTVAL / CURRVAL." },
  { id: "functions", title: "Vstavané funkcie a dátumy", blurb: "SYSDATE, TO_CHAR, EXTRACT, MONTHS_BETWEEN, ADD_MONTHS, SUBSTR." },
  { id: "plsql", title: "PL/SQL — procedúry, funkcie, triggre, kurzory", blurb: "Anonymné bloky, procedúry, funkcie, triggre, kurzory." },
  { id: "transactions", title: "Transakcie a ACID", blurb: "COMMIT, ROLLBACK, SAVEPOINT, ACID, automatický commit pri DDL." },
  { id: "normalization", title: "Normalizácia a funkčné závislosti", blurb: "FZ, determinanty, 1NF–BCNF, dekompozícia, kandidáti PK." },
  { id: "er-modeling", title: "ERA modelovanie", blurb: "Entity, vzťahy, kardinalita, členstvo, identifikačný vs neidentifikačný." },
  { id: "integrity", title: "Integrita a kľúče", blurb: "Entitná / referenčná / doménová / používateľská integrita; kľúče." },
  { id: "relational-algebra", title: "Relačná algebra", blurb: "Výber, projekcia, spojenia, množinové operácie, delenie, union-kompatibilita." },
];

export const TOPIC_MAP: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.id, t]),
);

export function topicTitle(id: string): string {
  return TOPIC_MAP[id]?.title ?? id;
}
