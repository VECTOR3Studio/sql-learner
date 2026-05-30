import type { SandboxTable } from "@/types";

// SQLite verzia schémy SOCIÁLNEJ POISŤOVNE z ERA diagramu k skúške.
// Dátumy sú uložené ako ISO text ('RRRR-MM-DD'); v sandboxe použi strftime()
// a julianday() (Oracle by použil EXTRACT/TO_CHAR/MONTHS_BETWEEN — pozri lekcie).
// Doména "eura" je v SQLite reprezentovaná ako REAL.

export const SANDBOX_TABLES: SandboxTable[] = [
  {
    name: "p_krajina",
    description: "Krajiny (číselník).",
    ddl: `CREATE TABLE p_krajina (
  id_krajiny TEXT PRIMARY KEY,   -- Char(3)
  n_krajiny  TEXT NOT NULL
);`,
    seed: [
      "INSERT INTO p_krajina VALUES ('SVK','Slovensko');",
      "INSERT INTO p_krajina VALUES ('CZE','Cesko');",
    ],
  },
  {
    name: "p_kraj",
    description: "Kraje; id_krajiny odkazuje na krajinu.",
    ddl: `CREATE TABLE p_kraj (
  id_kraja   TEXT PRIMARY KEY,   -- Char(2)
  n_kraja    TEXT NOT NULL,
  id_krajiny TEXT REFERENCES p_krajina(id_krajiny)
);`,
    seed: [
      "INSERT INTO p_kraj VALUES ('TN','Trenciansky','SVK');",
      "INSERT INTO p_kraj VALUES ('ZA','Zilinsky','SVK');",
      "INSERT INTO p_kraj VALUES ('PO','Presovsky','SVK');", // kraj bez miest (anti-join)
    ],
  },
  {
    name: "p_okres",
    description: "Okresy; id_kraja odkazuje na kraj.",
    ddl: `CREATE TABLE p_okres (
  id_okresu TEXT PRIMARY KEY,    -- Char(2)
  n_okresu  TEXT NOT NULL,
  id_kraja  TEXT REFERENCES p_kraj(id_kraja)
);`,
    seed: [
      "INSERT INTO p_okres VALUES ('01','Prievidza','TN');",
      "INSERT INTO p_okres VALUES ('02','Zilina','ZA');",
      "INSERT INTO p_okres VALUES ('03','Bytca','ZA');",
      "INSERT INTO p_okres VALUES ('04','Poprad','PO');",
    ],
  },
  {
    name: "p_mesto",
    description: "Mestá, kľúčované PSČ; id_okresu odkazuje na okres.",
    ddl: `CREATE TABLE p_mesto (
  PSC       TEXT PRIMARY KEY,    -- Char(5)
  n_mesta   TEXT NOT NULL,
  id_okresu TEXT REFERENCES p_okres(id_okresu)
);`,
    seed: [
      "INSERT INTO p_mesto VALUES ('97101','Prievidza','01');",
      "INSERT INTO p_mesto VALUES ('02001','Puchov','01');",
      "INSERT INTO p_mesto VALUES ('01001','Zilina','02');",
      "INSERT INTO p_mesto VALUES ('01401','Bytca','03');",
      "INSERT INTO p_mesto VALUES ('05801','Poprad','04');",
    ],
  },
  {
    name: "p_typ_prispevku",
    description: "Číselník typov príspevkov.",
    ddl: `CREATE TABLE p_typ_prispevku (
  id_typu     INTEGER PRIMARY KEY,
  zakl_vyska  REAL NOT NULL,     -- eura
  popis       TEXT NOT NULL      -- Varchar2(10)
);`,
    seed: [
      "INSERT INTO p_typ_prispevku VALUES (1,250,'invalidny');",
      "INSERT INTO p_typ_prispevku VALUES (2,300,'rodicovsky');",
      "INSERT INTO p_typ_prispevku VALUES (3,200,'nezamest');", // prispevok v nezamestnanosti
      "INSERT INTO p_typ_prispevku VALUES (4,180,'nemocensky');",
    ],
  },
  {
    name: "p_typ_postihnutia",
    description: "Číselník typov postihnutia (pre ZŤP).",
    ddl: `CREATE TABLE p_typ_postihnutia (
  id_postihnutia    INTEGER PRIMARY KEY,
  nazov_postihnutia TEXT
);`,
    seed: [
      "INSERT INTO p_typ_postihnutia VALUES (1,'telesne');",
      "INSERT INTO p_typ_postihnutia VALUES (2,'zrakove');",
    ],
  },
  {
    name: "p_zamestnavatel",
    description: "Zamestnávatelia, kľúčované IČO.",
    ddl: `CREATE TABLE p_zamestnavatel (
  ICO   TEXT PRIMARY KEY,        -- Char(11)
  nazov TEXT NOT NULL,
  PSC   TEXT REFERENCES p_mesto(PSC),
  ulica TEXT
);`,
    seed: [
      "INSERT INTO p_zamestnavatel VALUES ('36000000001','Firma A s.r.o.','97101','Hlavna 1');",
      "INSERT INTO p_zamestnavatel VALUES ('36000000002','Firma B a.s.','01001','Vodna 2');",
    ],
  },
  {
    name: "p_platitel",
    description: "Platitelia poistného.",
    ddl: `CREATE TABLE p_platitel (
  id_platitela TEXT PRIMARY KEY  -- Char(11)
);`,
    seed: [
      "INSERT INTO p_platitel VALUES ('PL000000001');",
      "INSERT INTO p_platitel VALUES ('PL000000002');",
      "INSERT INTO p_platitel VALUES ('PL000000003');",
    ],
  },
  {
    name: "p_osoba",
    description: "Osoby, kľúčované rodným číslom; PSC odkazuje na mesto.",
    ddl: `CREATE TABLE p_osoba (
  rod_cislo  TEXT PRIMARY KEY,   -- Char(11), napr. '801106/3456'
  meno       TEXT,
  priezvisko TEXT,
  PSC        TEXT REFERENCES p_mesto(PSC),
  ulica      TEXT
);`,
    seed: [
      "INSERT INTO p_osoba VALUES ('801106/3456','Peter','Novak','97101','Hlavna 1');",
      "INSERT INTO p_osoba VALUES ('790310/2145','Juraj','Papun','01001','Kosicka 2');",
      "INSERT INTO p_osoba VALUES ('855512/7539','Michal','Matiasko','01401','Tulska 3');",
      "INSERT INTO p_osoba VALUES ('905521/1234','Erika','Lipovska','97101','Lipova 4');",
      "INSERT INTO p_osoba VALUES ('770913/3326','Frantisek','Murgas','05801','SNP 5');",
      "INSERT INTO p_osoba VALUES ('811201/9988','Zuzana','Kratka','02001','Orlove 6');", // bez poistenia
    ],
  },
  {
    name: "p_poistenie",
    description: "Poistenia osôb; dat_do IS NULL = aktívne poistenie.",
    ddl: `CREATE TABLE p_poistenie (
  id_poistenca INTEGER PRIMARY KEY,
  rod_cislo    TEXT REFERENCES p_osoba(rod_cislo),
  id_platitela TEXT REFERENCES p_platitel(id_platitela),
  oslobodeny   TEXT,             -- Char(1): 'A'/'N'
  dat_od       TEXT NOT NULL,
  dat_do       TEXT
);`,
    seed: [
      "INSERT INTO p_poistenie VALUES (1001,'801106/3456','PL000000001','N','2015-01-01',NULL);",
      "INSERT INTO p_poistenie VALUES (1002,'790310/2145','PL000000001','N','2010-03-01',NULL);", // >10 rokov
      "INSERT INTO p_poistenie VALUES (1003,'855512/7539','PL000000002','A','2018-06-01','2022-06-01');",
      "INSERT INTO p_poistenie VALUES (1004,'905521/1234','PL000000002','N','2019-09-01',NULL);",
      "INSERT INTO p_poistenie VALUES (1005,'770913/3326','PL000000003','N','2012-02-01',NULL);",
    ],
  },
  {
    name: "p_poberatel",
    description: "Poberatelia príspevkov; perc_vyj = percentuálne vyjadrenie.",
    ddl: `CREATE TABLE p_poberatel (
  id_poberatela INTEGER PRIMARY KEY,
  rod_cislo     TEXT REFERENCES p_osoba(rod_cislo),
  id_typu       INTEGER REFERENCES p_typ_prispevku(id_typu),
  perc_vyj      REAL NOT NULL,
  dat_od        TEXT NOT NULL,
  dat_do        TEXT
);`,
    seed: [
      "INSERT INTO p_poberatel VALUES (5001,'801106/3456',1,80,'2020-01-01',NULL);",
      "INSERT INTO p_poberatel VALUES (5002,'801106/3456',2,50,'2021-01-01',NULL);",
      "INSERT INTO p_poberatel VALUES (5003,'801106/3456',4,100,'2022-01-01',NULL);", // Peter ma 3 typy
      "INSERT INTO p_poberatel VALUES (5004,'790310/2145',3,100,'2023-01-01',NULL);", // Juraj nezamest. v Ziline
      "INSERT INTO p_poberatel VALUES (5005,'855512/7539',1,60,'2019-01-01','2021-01-01');",
      "INSERT INTO p_poberatel VALUES (5006,'770913/3326',2,40,'2022-06-01',NULL);",
      "INSERT INTO p_poberatel VALUES (5007,'905521/1234',3,5,'2024-01-01',NULL);", // perc_vyj < 10
    ],
  },
  {
    name: "p_historia",
    description: "História základnej výšky typov príspevkov.",
    ddl: `CREATE TABLE p_historia (
  id_typu    INTEGER REFERENCES p_typ_prispevku(id_typu),
  dat_od     TEXT,
  dat_do     TEXT,
  zakl_vyska REAL NOT NULL,
  PRIMARY KEY (id_typu, dat_od, dat_do)
);`,
    seed: [
      "INSERT INTO p_historia VALUES (1,'2015-01-01','2019-12-31',220);",
      "INSERT INTO p_historia VALUES (1,'2020-01-01','2023-12-31',240);",
    ],
  },
  {
    name: "p_prispevky",
    description: "Vyplatené príspevky; PK = (id_poberatela, obdobie).",
    ddl: `CREATE TABLE p_prispevky (
  id_poberatela INTEGER REFERENCES p_poberatel(id_poberatela),
  obdobie       TEXT,
  id_typu       INTEGER,
  kedy          TEXT,
  suma          REAL NOT NULL,   -- eura
  PRIMARY KEY (id_poberatela, obdobie)
);`,
    seed: [
      "INSERT INTO p_prispevky VALUES (5001,'2024-01-01',1,'2024-01-15',200);",
      "INSERT INTO p_prispevky VALUES (5001,'2024-02-01',1,'2024-02-15',200);",
      "INSERT INTO p_prispevky VALUES (5002,'2024-01-01',2,'2024-01-20',300);",
      "INSERT INTO p_prispevky VALUES (5004,'2024-01-01',3,'2024-01-10',180);",
      "INSERT INTO p_prispevky VALUES (5006,'2024-01-01',2,'2024-01-12',150);",
    ],
  },
  {
    name: "p_odvod_platba",
    description: "Platby odvodov poistencov.",
    ddl: `CREATE TABLE p_odvod_platba (
  cis_platby   INTEGER PRIMARY KEY,
  id_poistenca INTEGER REFERENCES p_poistenie(id_poistenca),
  suma         REAL NOT NULL,    -- eura
  dat_platby   TEXT,
  obdobie      TEXT
);`,
    seed: [
      "INSERT INTO p_odvod_platba VALUES (9001,1001,120,'2024-01-31','2024-01-01');",
      "INSERT INTO p_odvod_platba VALUES (9002,1001,120,'2024-02-29','2024-02-01');",
      "INSERT INTO p_odvod_platba VALUES (9003,1002,300,'2024-01-31','2024-01-01');", // Juraj najviac
      "INSERT INTO p_odvod_platba VALUES (9004,1005,90,'2024-01-31','2024-01-01');",
    ],
  },
  {
    name: "p_zamestnanec",
    description: "Zamestnanci; PK = (id_zamestnavatela, rod_cislo, dat_od).",
    ddl: `CREATE TABLE p_zamestnanec (
  id_zamestnavatela TEXT REFERENCES p_zamestnavatel(ICO),
  rod_cislo         TEXT REFERENCES p_osoba(rod_cislo),
  dat_od            TEXT,
  dat_do            TEXT,
  id_poistenca      INTEGER REFERENCES p_poistenie(id_poistenca),
  PRIMARY KEY (id_zamestnavatela, rod_cislo, dat_od)
);`,
    seed: [
      "INSERT INTO p_zamestnanec VALUES ('36000000001','801106/3456','2015-01-01',NULL,1001);",
      "INSERT INTO p_zamestnanec VALUES ('36000000001','855512/7539','2018-06-01','2022-06-01',1003);",
      "INSERT INTO p_zamestnanec VALUES ('36000000002','770913/3326','2012-02-01',NULL,1005);",
    ],
  },
  {
    name: "p_ZTP",
    description: "Záznamy ZŤP osôb.",
    ddl: `CREATE TABLE p_ZTP (
  id_ZTP         TEXT PRIMARY KEY,  -- Char(6)
  rod_cislo      TEXT REFERENCES p_osoba(rod_cislo),
  dat_od         TEXT,
  dat_do         TEXT,
  id_postihnutia INTEGER REFERENCES p_typ_postihnutia(id_postihnutia)
);`,
    seed: [
      "INSERT INTO p_ZTP VALUES ('000001','905521/1234','2020-01-01',NULL,1);",
    ],
  },
];

export interface SandboxExample {
  label: string;
  topic: string;
  sql: string;
}

export const SANDBOX_EXAMPLES: SandboxExample[] = [
  {
    label: "Počet nezamestnaných osôb v každom meste (0 ak sú všetci zamestnaní)",
    topic: "subqueries",
    sql:
      "SELECT m.n_mesta,\n  COUNT(CASE WHEN NOT EXISTS (\n    SELECT 1 FROM p_zamestnanec z\n    WHERE z.rod_cislo = o.rod_cislo AND z.dat_do IS NULL\n  ) THEN 1 END) AS pocet_nezamestnanych\nFROM p_mesto m\nLEFT JOIN p_osoba o ON o.PSC = m.PSC\nGROUP BY m.n_mesta\nORDER BY pocet_nezamestnanych DESC;",
  },
  {
    label: "Všetky kraje a ich mestá (vrátane krajov bez miest)",
    topic: "joins",
    sql:
      "SELECT k.n_kraja, m.n_mesta\nFROM p_kraj k\nLEFT JOIN p_okres o ON o.id_kraja = k.id_kraja\nLEFT JOIN p_mesto m ON m.id_okresu = o.id_okresu\nORDER BY k.n_kraja, m.n_mesta;",
  },
  {
    label: "Osoby s aspoň 3 rôznymi typmi príspevkov",
    topic: "aggregates",
    sql:
      "SELECT o.rod_cislo, o.priezvisko, COUNT(DISTINCT pb.id_typu) AS pocet_typov\nFROM p_osoba o\nJOIN p_poberatel pb ON pb.rod_cislo = o.rod_cislo\nGROUP BY o.rod_cislo, o.priezvisko\nHAVING COUNT(DISTINCT pb.id_typu) >= 3;",
  },
  {
    label: "Mestá, kde nie je žiadny poberateľ príspevku v nezamestnanosti (id_typu = 3)",
    topic: "subqueries",
    sql:
      "SELECT DISTINCT m.n_mesta\nFROM p_mesto m\nJOIN p_osoba o ON o.PSC = m.PSC\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poberatel pb\n  WHERE pb.rod_cislo = o.rod_cislo AND pb.id_typu = 3\n);",
  },
  {
    label: "Ku každej osobe celkový počet dní poistenia",
    topic: "functions",
    sql:
      "SELECT o.rod_cislo, o.priezvisko,\n  SUM(CAST(julianday(COALESCE(p.dat_do,'now')) - julianday(p.dat_od) AS INT)) AS dni_poistenia\nFROM p_osoba o\nJOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\nGROUP BY o.rod_cislo, o.priezvisko;",
  },
  {
    label: "Osoba, ktorá zaplatila najviac na odvodoch (HAVING + vnorený MAX)",
    topic: "subqueries",
    sql:
      "SELECT id_poistenca, SUM(suma) AS spolu\nFROM p_odvod_platba\nGROUP BY id_poistenca\nHAVING SUM(suma) = (\n  SELECT MAX(s) FROM (\n    SELECT SUM(suma) AS s FROM p_odvod_platba GROUP BY id_poistenca\n  )\n);",
  },
  {
    label: "Osoby, ktoré momentálne nie sú poistené",
    topic: "subqueries",
    sql:
      "SELECT o.rod_cislo, o.meno, o.priezvisko\nFROM p_osoba o\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poistenie p\n  WHERE p.rod_cislo = o.rod_cislo AND p.dat_do IS NULL\n);",
  },
  {
    label: "Typy príspevkov a počet ich aktuálnych poberateľov",
    topic: "aggregates",
    sql:
      "SELECT tp.id_typu, tp.popis, COUNT(pb.id_poberatela) AS aktualni\nFROM p_typ_prispevku tp\nLEFT JOIN p_poberatel pb\n  ON pb.id_typu = tp.id_typu AND pb.dat_do IS NULL\nGROUP BY tp.id_typu, tp.popis;",
  },
];
