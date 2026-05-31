import type { Practical, PracticalCategory } from "@/types";

// Praktické úlohy na písanie SQL / PL-SQL kódu, ako sa objavujú v materiáloch
// (schéma sociálnej poisťovne, p_ tabuľky). `answer` je riešenie v Oracle dialekte
// tak, ako na skúške; `sandbox` (ak je) je SQLite-kompatibilný variant pre tlačidlo
// „Otvoriť v sandboxe“.

export const PRACTICAL_CATEGORIES: { id: PracticalCategory; title: string }[] = [
  { id: "select", title: "Výberové dotazy (SELECT)" },
  { id: "dml", title: "DML — INSERT / UPDATE / DELETE" },
  { id: "ddl", title: "DDL a obmedzenia" },
  { id: "plsql-block", title: "PL/SQL — anonymné bloky" },
  { id: "trigger", title: "Triggre" },
  { id: "proc-func", title: "Procedúry a funkcie" },
];

export const PRACTICALS: Practical[] = [
  // ----------------------------- SELECT -----------------------------
  {
    id: "p-sel-mesiac6",
    category: "select",
    topic: "functions",
    prompt: "Vypíš mená všetkých osôb poistených v 6. mesiaci (jún) každého roka.",
    answerLang: "sql",
    answer:
      "SELECT o.meno, o.priezvisko\nFROM p_osoba o\nJOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\nWHERE EXTRACT(MONTH FROM p.dat_od) = 6;",
    oracleOnly: true,
    sandbox:
      "SELECT o.meno, o.priezvisko\nFROM p_osoba o\nJOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\nWHERE strftime('%m', p.dat_od) = '06';",
    note: "V Oracle EXTRACT(MONTH FROM dat_od) = 6; v SQLite sandboxe strftime('%m', dat_od) = '06'.",
  },
  {
    id: "p-sel-3typy",
    category: "select",
    topic: "aggregates",
    prompt: "Vypíš rodné čísla osôb, ktoré poberajú aspoň 3 rôzne typy príspevkov.",
    answerLang: "sql",
    answer:
      "SELECT rod_cislo, COUNT(DISTINCT id_typu) AS pocet_typov\nFROM p_poberatel\nGROUP BY rod_cislo\nHAVING COUNT(DISTINCT id_typu) >= 3;",
    sandbox:
      "SELECT rod_cislo, COUNT(DISTINCT id_typu) AS pocet_typov\nFROM p_poberatel\nGROUP BY rod_cislo\nHAVING COUNT(DISTINCT id_typu) >= 3;",
  },
  {
    id: "p-sel-mesta-bez-nezamest",
    category: "select",
    topic: "subqueries",
    prompt:
      "Vypíš mestá, v ktorých sa nenachádza žiaden poberateľ príspevku v nezamestnanosti (id_typu = 3).",
    answerLang: "sql",
    answer:
      "SELECT DISTINCT m.n_mesta\nFROM p_mesto m\nJOIN p_osoba o ON o.PSC = m.PSC\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poberatel pb\n  WHERE pb.rod_cislo = o.rod_cislo AND pb.id_typu = 3\n);",
    sandbox:
      "SELECT DISTINCT m.n_mesta\nFROM p_mesto m\nJOIN p_osoba o ON o.PSC = m.PSC\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poberatel pb\n  WHERE pb.rod_cislo = o.rod_cislo AND pb.id_typu = 3\n);",
  },
  {
    id: "p-sel-dni-poistenia",
    category: "select",
    topic: "functions",
    prompt: "Ku každej osobe vypíš celkový počet dní, počas ktorých bola poistená.",
    answerLang: "sql",
    answer:
      "SELECT o.rod_cislo,\n  SUM(TRUNC(NVL(p.dat_do, SYSDATE)) - TRUNC(p.dat_od)) AS pocet_dni\nFROM p_osoba o\nJOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\nGROUP BY o.rod_cislo;",
    oracleOnly: true,
    sandbox:
      "SELECT o.rod_cislo,\n  SUM(CAST(julianday(COALESCE(p.dat_do,'now')) - julianday(p.dat_od) AS INT)) AS pocet_dni\nFROM p_osoba o\nJOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\nGROUP BY o.rod_cislo;",
  },
  {
    id: "p-sel-nepoistene",
    category: "select",
    topic: "subqueries",
    prompt:
      "Vypíš osoby (rodné číslo, meno, priezvisko), ktoré momentálne nie sú poistené (nemajú záznam v p_poistenie s dat_do IS NULL).",
    answerLang: "sql",
    answer:
      "SELECT o.rod_cislo, o.meno, o.priezvisko\nFROM p_osoba o\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poistenie p\n  WHERE p.rod_cislo = o.rod_cislo AND p.dat_do IS NULL\n);",
    sandbox:
      "SELECT o.rod_cislo, o.meno, o.priezvisko\nFROM p_osoba o\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poistenie p\n  WHERE p.rod_cislo = o.rod_cislo AND p.dat_do IS NULL\n);",
  },
  {
    id: "p-sel-nezamest-mesto",
    category: "select",
    topic: "subqueries",
    prompt:
      "Pre každé mesto vypíš počet nezamestnaných osôb, ktoré v ňom bývajú (ak sú všetci zamestnaní, vypíš 0).",
    answerLang: "sql",
    answer:
      "SELECT m.n_mesta,\n  COUNT(CASE WHEN NOT EXISTS (\n    SELECT 1 FROM p_zamestnanec z\n    WHERE z.rod_cislo = o.rod_cislo AND z.dat_do IS NULL\n  ) THEN 1 END) AS pocet_nezamestnanych\nFROM p_mesto m\nLEFT JOIN p_osoba o ON o.PSC = m.PSC\nGROUP BY m.n_mesta;",
    sandbox:
      "SELECT m.n_mesta,\n  COUNT(CASE WHEN NOT EXISTS (\n    SELECT 1 FROM p_zamestnanec z\n    WHERE z.rod_cislo = o.rod_cislo AND z.dat_do IS NULL\n  ) THEN 1 END) AS pocet_nezamestnanych\nFROM p_mesto m\nLEFT JOIN p_osoba o ON o.PSC = m.PSC\nGROUP BY m.n_mesta;",
  },
  {
    id: "p-sel-najviac-odvody",
    category: "select",
    topic: "subqueries",
    prompt:
      "Zisti, ktorá osoba (id_poistenca) zaplatila najviac peňazí na odvodoch za celý čas (suma v p_odvod_platba).",
    answerLang: "sql",
    answer:
      "SELECT id_poistenca, SUM(suma) AS spolu\nFROM p_odvod_platba\nGROUP BY id_poistenca\nHAVING SUM(suma) = (\n  SELECT MAX(s) FROM (\n    SELECT SUM(suma) AS s FROM p_odvod_platba GROUP BY id_poistenca\n  )\n);",
    sandbox:
      "SELECT id_poistenca, SUM(suma) AS spolu\nFROM p_odvod_platba\nGROUP BY id_poistenca\nHAVING SUM(suma) = (\n  SELECT MAX(s) FROM (\n    SELECT SUM(suma) AS s FROM p_odvod_platba GROUP BY id_poistenca\n  )\n);",
  },
  {
    id: "p-sel-kraje-bez-poistenej",
    category: "select",
    topic: "joins",
    prompt:
      "Vypíš názvy krajov, v ktorých sa nachádzajú mestá bez žiadnej aktuálne poistenej osoby.",
    answerLang: "sql",
    answer:
      "SELECT DISTINCT k.n_kraja\nFROM p_kraj k\nJOIN p_okres ok ON ok.id_kraja = k.id_kraja\nJOIN p_mesto m ON m.id_okresu = ok.id_okresu\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM p_osoba o\n  JOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\n  WHERE o.PSC = m.PSC AND p.dat_do IS NULL\n);",
    sandbox:
      "SELECT DISTINCT k.n_kraja\nFROM p_kraj k\nJOIN p_okres ok ON ok.id_kraja = k.id_kraja\nJOIN p_mesto m ON m.id_okresu = ok.id_okresu\nWHERE NOT EXISTS (\n  SELECT 1\n  FROM p_osoba o\n  JOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\n  WHERE o.PSC = m.PSC AND p.dat_do IS NULL\n);",
  },
  {
    id: "p-sel-kraje-aj-bez-miest",
    category: "select",
    topic: "joins",
    prompt: "Vypíš všetky kraje a k nim mestá vrátane krajov, ku ktorým neexistuje žiadne mesto.",
    answerLang: "sql",
    answer:
      "SELECT k.n_kraja, m.n_mesta\nFROM p_kraj k\nLEFT JOIN p_okres ok ON ok.id_kraja = k.id_kraja\nLEFT JOIN p_mesto m ON m.id_okresu = ok.id_okresu\nORDER BY k.n_kraja, m.n_mesta;",
    sandbox:
      "SELECT k.n_kraja, m.n_mesta\nFROM p_kraj k\nLEFT JOIN p_okres ok ON ok.id_kraja = k.id_kraja\nLEFT JOIN p_mesto m ON m.id_okresu = ok.id_okresu\nORDER BY k.n_kraja, m.n_mesta;",
  },
  {
    id: "p-sel-union-poistenci",
    category: "select",
    topic: "relational-algebra",
    prompt:
      "Vyber všetkých poistencov a všetkých poberateľov (rodné čísla) a spoj ich do jednej množiny.",
    answerLang: "sql",
    answer:
      "SELECT rod_cislo FROM p_poistenie\nUNION\nSELECT rod_cislo FROM p_poberatel;",
    sandbox:
      "SELECT rod_cislo FROM p_poistenie\nUNION\nSELECT rod_cislo FROM p_poberatel;",
  },

  // ----------------------------- DML -----------------------------
  {
    id: "p-dml-insert-nove",
    category: "dml",
    topic: "dml",
    prompt: "Vlož do p_osoba nové záznamy z tabuľky nove_osoby (rovnaká štruktúra), ktoré tam ešte nie sú.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "INSERT INTO p_osoba (rod_cislo, meno, priezvisko, PSC, ulica)\nSELECT rod_cislo, meno, priezvisko, psc, ulica\nFROM nove_osoby n\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_osoba o WHERE o.rod_cislo = n.rod_cislo\n);",
  },
  {
    id: "p-dml-ukonci-10rokov",
    category: "dml",
    topic: "dml",
    prompt: "Nastav dat_do = SYSDATE pre všetky poistenia, ktoré nemajú koniec a sú aktívne dlhšie ako 10 rokov.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "UPDATE p_poistenie\nSET dat_do = SYSDATE\nWHERE dat_do IS NULL\n  AND dat_od < ADD_MONTHS(SYSDATE, -120);",
  },
  {
    id: "p-dml-vymaz-typy",
    category: "dml",
    topic: "dml",
    prompt: "Vymaž z p_typ_prispevku všetky typy príspevkov, ktoré sa nikdy nepoužili. Pozor na referenčnú integritu.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "DELETE FROM p_typ_prispevku tp\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poberatel pb WHERE pb.id_typu = tp.id_typu\n);",
  },
  {
    id: "p-dml-ukonci-poberatela",
    category: "dml",
    topic: "dml",
    prompt: "Ukonči poberateľa (nastav dat_do na dnešný deň), ak má percentuálne vyjadrenie menšie ako 10.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "UPDATE p_poberatel\nSET dat_do = SYSDATE\nWHERE perc_vyj < 10\n  AND dat_do IS NULL;",
  },

  // ----------------------------- DDL -----------------------------
  {
    id: "p-ddl-slobodny",
    category: "ddl",
    topic: "constraints",
    prompt: "Pridaj do tabuľky p_osoba stĺpec slobodny typu CHAR(1), ktorý môže mať len hodnoty 'A' alebo 'N'.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "ALTER TABLE p_osoba ADD slobodny CHAR(1);\n\nALTER TABLE p_osoba\n  ADD CONSTRAINT chk_slobodny CHECK (slobodny IN ('A','N'));",
  },
  {
    id: "p-ddl-suma",
    category: "ddl",
    topic: "constraints",
    prompt: "Do tabuľky p_prispevky pridaj atribút suma typu NUMBER, ktorý nesmie byť záporný.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "ALTER TABLE p_prispevky ADD suma NUMBER;\n\nALTER TABLE p_prispevky\n  ADD CONSTRAINT chk_suma CHECK (suma >= 0);",
  },
  {
    id: "p-ddl-vek",
    category: "ddl",
    topic: "constraints",
    prompt: "Pridaj do tabuľky p_osoba atribút vek typu INTEGER s podmienkou, že musí byť medzi 18 a 100.",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "ALTER TABLE p_osoba\n  ADD vek INTEGER CHECK (vek BETWEEN 18 AND 100);",
  },
  {
    id: "p-ddl-pk",
    category: "ddl",
    topic: "ddl",
    prompt: "V tabuľke p_zamestnanec nastav primárny kľúč ako kombináciu (rod_cislo, ico, dat_od).",
    answerLang: "sql",
    oracleOnly: true,
    answer:
      "ALTER TABLE p_zamestnanec\n  ADD CONSTRAINT pk_p_zamestnanec PRIMARY KEY (rod_cislo, ico, dat_od);",
  },

  // ----------------------------- PL/SQL blok -----------------------------
  {
    id: "p-blk-priezvisko-v",
    category: "plsql-block",
    topic: "plsql",
    prompt: "Vytvor anonymný blok, v ktorom vypíšeš na konzolu počet osôb, ktorých priezvisko začína na písmeno V.",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "DECLARE\n  pocet_osob NUMBER;\nBEGIN\n  SELECT COUNT(*) INTO pocet_osob\n  FROM p_osoba\n  WHERE priezvisko LIKE 'V%';\n  DBMS_OUTPUT.PUT_LINE('Pocet osob s priezviskom na V: ' || pocet_osob);\nEND;\n/",
  },
  {
    id: "p-blk-priemer-invalidny",
    category: "plsql-block",
    topic: "plsql",
    prompt: "Použi anonymný blok na výpočet a výpis priemernej výšky príspevkov typu 'invalidný' (id_typu = 1).",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "DECLARE\n  priemer NUMBER;\nBEGIN\n  SELECT AVG(suma) INTO priemer\n  FROM p_prispevky\n  WHERE id_typu = 1;\n  DBMS_OUTPUT.PUT_LINE('Priemerny invalidny prispevok: ' || priemer);\nEND;\n/",
  },

  // ----------------------------- Triggre -----------------------------
  {
    id: "p-trg-jedno-poistenie",
    category: "trigger",
    topic: "plsql",
    prompt:
      "Napíš trigger, ktorým zabezpečíš, že nový poistný záznam (p_poistenie) sa nedá vytvoriť, ak osoba už má aktívne poistenie.",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE TRIGGER trg_aktivne_poistenie\nBEFORE INSERT OR UPDATE ON p_poistenie\nFOR EACH ROW\nDECLARE\n  v_count NUMBER;\nBEGIN\n  SELECT COUNT(*) INTO v_count\n  FROM p_poistenie\n  WHERE rod_cislo = :NEW.rod_cislo AND dat_do IS NULL;\n  IF v_count > 0 THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Osoba ma uz aktivne poistenie.');\n  END IF;\nEND;\n/",
  },
  {
    id: "p-trg-suma-zaporna",
    category: "trigger",
    topic: "plsql",
    prompt: "Napíš trigger, ktorý zabráni vloženiu záznamu do p_prispevky, ak je suma < 0.",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE TRIGGER trg_suma_nezaporna\nBEFORE INSERT ON p_prispevky\nFOR EACH ROW\nBEGIN\n  IF :NEW.suma < 0 THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Suma nemoze byt zaporna.');\n  END IF;\nEND;\n/",
  },
  {
    id: "p-trg-3-prispevky",
    category: "trigger",
    topic: "plsql",
    prompt: "Napíš trigger, ktorý zabezpečí, aby poberateľ nemal evidovaných viac ako 3 príspevky v rovnakom mesiaci.",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE TRIGGER trg_max3_mesiac\nBEFORE INSERT ON p_prispevky\nFOR EACH ROW\nDECLARE\n  v_count NUMBER;\nBEGIN\n  SELECT COUNT(*) INTO v_count\n  FROM p_prispevky\n  WHERE id_poberatela = :NEW.id_poberatela\n    AND TRUNC(obdobie, 'MM') = TRUNC(:NEW.obdobie, 'MM');\n  IF v_count >= 3 THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Max 3 prispevky v mesiaci.');\n  END IF;\nEND;\n/",
  },
  {
    id: "p-trg-nezmaz-osobu",
    category: "trigger",
    topic: "plsql",
    prompt:
      "Vytvor trigger, ktorý nedovolí zmazať osobu, ak má v systéme evidované aspoň jedno poistenie alebo príspevok (poberateľa).",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE TRIGGER trg_nezmaz_osobu\nBEFORE DELETE ON p_osoba\nFOR EACH ROW\nDECLARE\n  v_count NUMBER;\nBEGIN\n  SELECT COUNT(*) INTO v_count FROM (\n    SELECT rod_cislo FROM p_poistenie WHERE rod_cislo = :OLD.rod_cislo\n    UNION ALL\n    SELECT rod_cislo FROM p_poberatel WHERE rod_cislo = :OLD.rod_cislo\n  );\n  IF v_count > 0 THEN\n    RAISE_APPLICATION_ERROR(-20001,\n      'Osoba ma poistku alebo prispevok - zmazanie nie je povolene.');\n  END IF;\nEND;\n/",
  },

  // ----------------------------- Procedúry & funkcie -----------------------------
  {
    id: "p-fn-roky-poistenia",
    category: "proc-func",
    topic: "plsql",
    prompt: "Napíš funkciu, ktorá pre dané rodné číslo vráti počet rokov, počas ktorých bola osoba poistená.",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE FUNCTION roky_poistenia (p_rc IN p_poistenie.rod_cislo%TYPE)\n  RETURN NUMBER\nAS\n  roky NUMBER;\nBEGIN\n  SELECT SUM(MONTHS_BETWEEN(NVL(dat_do, SYSDATE), dat_od)) / 12\n    INTO roky\n  FROM p_poistenie\n  WHERE rod_cislo = p_rc;\n  RETURN roky;\nEND;\n/",
  },
  {
    id: "p-proc-ukonci-poistenie",
    category: "proc-func",
    topic: "plsql",
    prompt: "Vytvor procedúru, ktorá ukončí všetky poistenia osoby podľa zadaného rodného čísla (nastaví dat_do na SYSDATE).",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE PROCEDURE ukonci_poistenie (p_rc IN p_osoba.rod_cislo%TYPE)\nIS\nBEGIN\n  UPDATE p_poistenie\n  SET dat_do = SYSDATE\n  WHERE rod_cislo = p_rc AND dat_do IS NULL;\nEND;\n/",
  },
  {
    id: "p-fn-priemer-osoba",
    category: "proc-func",
    topic: "plsql",
    prompt: "Napíš funkciu, ktorá vráti priemernú výšku všetkých príspevkov poberaných danou osobou.",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE FUNCTION priemerny_prispevok (p_rc IN p_osoba.rod_cislo%TYPE)\n  RETURN NUMBER\nAS\n  priemer NUMBER;\nBEGIN\n  SELECT AVG(pr.suma) INTO priemer\n  FROM p_poberatel pb\n  JOIN p_prispevky pr ON pr.id_poberatela = pb.id_poberatela\n  WHERE pb.rod_cislo = p_rc;\n  RETURN priemer;\nEND;\n/",
  },
  {
    id: "p-proc-zmaz-bez-vazby",
    category: "proc-func",
    topic: "plsql",
    prompt: "Vytvor procedúru, ktorá vymaže všetky osoby, ktoré nemajú žiadne poistenie ani príspevok (poberateľa).",
    answerLang: "plsql",
    oracleOnly: true,
    answer:
      "CREATE OR REPLACE PROCEDURE zmaz_osamotene\nIS\nBEGIN\n  DELETE FROM p_osoba o\n  WHERE NOT EXISTS (SELECT 1 FROM p_poberatel pb WHERE pb.rod_cislo = o.rod_cislo)\n    AND NOT EXISTS (SELECT 1 FROM p_poistenie p WHERE p.rod_cislo = o.rod_cislo);\nEND;\n/",
  },
];

export const PRACTICAL_MAP: Record<string, Practical> = Object.fromEntries(
  PRACTICALS.map((p) => [p.id, p]),
);
