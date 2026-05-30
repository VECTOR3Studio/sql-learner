import type { QuizQuestion } from "@/types";

// Otázky spracované z priložených skúškových materiálov. Indexy `correct` sú
// 0-based a riadia sa kľúčom vyznačeným v dokumentoch.

export const QUESTIONS: QuizQuestion[] = [
  // ---------------- SPOJENIA / počítanie riadkov ----------------
  {
    id: "q-joins-count-1",
    topic: "joins",
    kind: "mcq",
    prompt:
      "OPRAVA má 1000 záznamov (250 ešte prebieha). Je 1000 porúch, ale iba 600 je napojených na opravu (tých 600 je už ukončených). Čo vráti príkaz?",
    code:
      "SELECT COUNT(*) FROM b_oprava RIGHT JOIN b_porucha USING(id_porucha) WHERE do IS NOT NULL;",
    choices: ["250", "600", "400", "0", "1000"],
    correct: [1],
    explanation:
      "RIGHT JOIN zachová všetkých 1000 porúch, ale `do IS NOT NULL` platí len pre 600 napojených na ukončenú opravu.",
  },
  {
    id: "q-joins-count-2",
    topic: "joins",
    kind: "mcq",
    prompt:
      "MIESTO má 10 záznamov; PARKOVANIE má 300 záznamov, ktoré odkazujú na existujúce miesta. Čo vráti príkaz?",
    code:
      "SELECT COUNT(*) FROM b_miesto JOIN b_parkovanie USING(id_miesto, id_stojan);",
    choices: ["300", "600", "0", "1500"],
    correct: [0],
    explanation:
      "Vnútorné spojenie vytvorí presne jeden riadok na zhodný pár; všetkých 300 parkovaní sa zhoduje → 300.",
  },
  {
    id: "q-joins-count-3",
    topic: "joins",
    kind: "mcq",
    prompt:
      "ZAMESTNANEC má 100 záznamov (50 aktuálnych, t. j. do IS NULL) a 11 typov (každý použitý 10×, jeden nepoužitý). Čo vráti príkaz?",
    code:
      "SELECT COUNT(*) FROM b_zamestnanec RIGHT JOIN b_typ_zamestnanca USING(id_typ) WHERE do IS NULL;",
    choices: ["51", "50", "101", "100"],
    correct: [0],
    explanation:
      "RIGHT JOIN zachová všetkých 11 typov. 50 aktuálnych zamestnancov sa zhoduje s typom (50 riadkov), nepoužitý typ pridá 1 riadok s NULL, ktorého `do` je NULL → 51.",
  },
  {
    id: "q-joins-count-4",
    topic: "joins",
    kind: "mcq",
    prompt: "Tie isté tabuľky, ale LEFT JOIN. Čo vráti príkaz?",
    code:
      "SELECT COUNT(*) FROM b_zamestnanec LEFT JOIN b_typ_zamestnanca USING(id_typ) WHERE do IS NULL;",
    choices: ["10", "50", "101", "100"],
    correct: [1],
    explanation:
      "LEFT zachová zamestnancov; nepoužitý typ nič nepridá. 50 aktuálnych zamestnancov → 50.",
  },
  {
    id: "q-joins-count-5",
    topic: "joins",
    kind: "mcq",
    prompt:
      "ZAKAZNIK má 100 záznamov; je 200 osobných údajov (os_udaje). Akú hodnotu vráti príkaz?",
    code:
      "SELECT COUNT(*) FROM b_zakaznik RIGHT JOIN b_os_udaje USING(rod_cislo);",
    choices: ["Rozsah <200,300)", "Rozsah <0,100>", "Iba 200", "Iba 0"],
    correct: [2],
    explanation:
      "RIGHT JOIN zachová všetkých 200 os_udaje; každý sa zhoduje s najviac jedným zákazníkom (rod_cislo je jednoznačné) → presne 200.",
  },

  // ---------------- AGREGÁCIE / GROUP BY ----------------
  {
    id: "q-agg-groupby-1",
    topic: "aggregates",
    kind: "mcq",
    prompt:
      "Doplňte SELECT, ktorý vypíše ku každému bicyklu rok zaradenia a koľkokrát bol požičaný.",
    code:
      "SELECT id_bicykel, to_char(zaradenie,'YYYY'), COUNT(*)\nFROM b_bicykel JOIN b_pozicanie USING (id_bicykel)\n____ ;",
    choices: [
      "GROUP BY id_bicykel, zaradenie",
      "GROUP BY id_bicykel, to_char(zaradenie,'YYYY'), COUNT(*)",
      "GROUP BY id_bicykel",
      "GROUP BY id_zakaznik, id_bicykel",
    ],
    correct: [0],
    explanation:
      "Zoskupuj podľa každého neagregovaného stĺpca. Nikdy nezoskupuj podľa agregátu ako COUNT(*).",
  },

  // ---------------- VNORENÉ DOPYTY ----------------
  {
    id: "q-sub-nostand-1",
    topic: "subqueries",
    kind: "mcq",
    prompt:
      "Ktorý SELECT vyberie všetky mestá, v ktorých sa NEnachádza žiadny stojan s nedefinovaným (NULL) atribútom `info`?",
    choices: [
      "SELECT * FROM b_MESTO WHERE psc NOT IN (SELECT psc FROM b_stojan WHERE info IS NULL);",
      "SELECT * FROM b_MESTO JOIN b_stojan USING(psc) WHERE info != NULL;",
      "SELECT * FROM b_MESTO JOIN b_stojan USING(psc) WHERE NOT IN (SELECT psc FROM b_stojan WHERE info IS NULL);",
      "SELECT * FROM b_MESTO JOIN b_stojan USING(psc) WHERE info IS NOT NULL;",
    ],
    correct: [0],
    explanation:
      "Anti-členstvo: vylúč každé mesto, ktorého PSČ je medzi stojanmi s NULL info. `!= NULL` nikdy nesedí.",
  },
  {
    id: "q-sub-noservice-1",
    topic: "subqueries",
    kind: "mcq",
    prompt: "Ktorý SELECT vyberie všetky bicykle, ktoré NEboli nikdy na veľkej servisnej prehliadke ('V')?",
    choices: [
      "SELECT * FROM b_bicykel WHERE id_bicykel NOT IN (SELECT id_bicykel FROM b_oprava WHERE druh='V');",
      "SELECT * FROM b_bicykel JOIN b_oprava ON (id_bicykel) WHERE id_oprava NOT IN (SELECT id_bicykel FROM b_oprava WHERE druh='V');",
      "SELECT * FROM b_bicykel WHERE id_bicykel NOT IN (SELECT id_oprava FROM b_oprava WHERE druh='V');",
      "SELECT * FROM b_bicykel JOIN b_oprava USING(id_bicykel) WHERE id_bicykel NOT IN (SELECT id_bicykel FROM b_oprava WHERE druh='V');",
    ],
    correct: [0],
    explanation:
      "Vezmi ID bicyklov, ktoré sa NEnachádzajú medzi opravami 'V'. Varianty so spojením nesprávne vynechajú bicykle bez opravy.",
  },
  {
    id: "q-sub-insert-notexists",
    topic: "subqueries",
    kind: "mcq",
    prompt:
      "Vlož do p_osoba záznamy z nove_osoby, ale iba tie, ktoré tam ešte nie sú. Ktorá podmienka je správna?",
    code:
      "INSERT INTO p_osoba (rod_cislo, meno, priezvisko, psc, ulica)\nSELECT rod_cislo, meno, priezvisko, psc, ulica\nFROM nove_osoby n\nWHERE ____ ;",
    choices: [
      "NOT EXISTS (SELECT 1 FROM p_osoba o WHERE o.rod_cislo = n.rod_cislo)",
      "EXISTS (SELECT 1 FROM p_osoba o WHERE o.rod_cislo = n.rod_cislo)",
      "NOT EXISTS (SELECT 1 FROM p_osoba o WHERE o.rod_cislo != n.rod_cislo)",
      "n.rod_cislo != (SELECT rod_cislo FROM p_osoba)",
    ],
    correct: [0],
    explanation:
      "Vlož len tých, pre ktorých NEEXISTUJE zhodný rod_cislo v p_osoba. Varianta s `!=` v korelovanej podmienke je logicky nesprávna.",
  },

  // ---------------- TRANSAKCIE ----------------
  {
    id: "q-tx-count-1",
    topic: "transactions",
    kind: "mcq",
    prompt:
      "tab1(id PK). insert 1; insert 2; insert 3; insert 4; ROLLBACK; insert 5; insert 6; insert 4; COMMIT; Čo vráti SELECT COUNT(*) FROM tab1?",
    choices: ["6", "0", "Chyba", "4", "3"],
    correct: [4],
    explanation:
      "ROLLBACK zruší 1–4. Potom sa vložia 5, 6, 4 a commitnú → 3 riadky.",
  },
  {
    id: "q-tx-max-1",
    topic: "transactions",
    kind: "mcq",
    prompt:
      "tab1(id PK). insert 1; insert 2; insert 3; COMMIT; insert 5; ROLLBACK; insert 6; insert 4; COMMIT; Čo vráti SELECT MAX(id)?",
    choices: ["6", "0", "Chyba", "3"],
    correct: [0],
    explanation: "5 sa zruší rollbackom; ostávajú 1,2,3,6,4 → MAX = 6.",
  },
  {
    id: "q-tx-ddl-1",
    topic: "transactions",
    kind: "mcq",
    prompt:
      "tab1(pk PK). insert 10; insert 20; ALTER TABLE tab1 ADD (cislo INTEGER); insert (30,1); ROLLBACK; Čo vráti SELECT MAX(pk)?",
    choices: ["20", "30", "3", "2"],
    correct: [0],
    explanation:
      "DDL (ALTER) automaticky commitne 10 a 20. Rollbackuje sa len vloženie (30,1) → MAX = 20.",
  },
  {
    id: "q-tx-savepoint-1",
    topic: "transactions",
    kind: "mcq",
    prompt:
      "tab1(pk PK). insert 10; insert 20; SAVEPOINT s1; DELETE FROM tab1 WHERE pk=10; ROLLBACK TO s1; insert 30; COMMIT; Čo vráti SELECT COUNT(*) FROM tab1?",
    choices: ["3", "2", "1", "0"],
    correct: [0],
    explanation:
      "ROLLBACK TO s1 vráti vymazanie 10 (10 je späť). Po commite ostávajú 10, 20, 30 → 3.",
  },

  // ---------------- KURZORY / PLSQL ----------------
  {
    id: "q-cursor-order-1",
    topic: "plsql",
    kind: "mcq",
    prompt:
      "Vnútri BEGIN…LOOP…END LOOP…END, aké je správne poradie CLOSE(1), OPEN(2), FETCH…INTO(3), EXIT WHEN %NOTFOUND(4), aby sme prešli každý riadok kurzora práve raz?",
    choices: ["4,1,2,3", "1,2,3,4", "2,3,4,1", "3,4,1,2"],
    correct: [2],
    explanation: "OPEN pred slučkou, FETCH potom EXIT vnútri, CLOSE po slučke → 2,3,4,1.",
  },
  {
    id: "q-cursor-distinct-1",
    topic: "plsql",
    kind: "mcq",
    prompt:
      "Kurzor SELECT nazov FROM b_mesto JOIN b_stojan USING(psc). Ako zabezpečíte, aby vrátil len unikátne názvy miest?",
    choices: [
      "Pridať GROUP BY nazov",
      "Pridať GROUP BY nazov, psc",
      "Pridať in/exists, v ktorom vyberieme príslušné stojany",
      "Netreba meniť nič — kurzor to už robí",
    ],
    correct: [0],
    explanation: "GROUP BY nazov (alebo DISTINCT) zlúči duplicitné názvy miest.",
  },
  {
    id: "q-plsql-selectinto-1",
    topic: "plsql",
    kind: "mcq",
    prompt: "Ktoré tvrdenie o SQL vnútri PL/SQL bloku je správne?",
    choices: [
      "Možno použiť SELECT-INTO, ktorý vráti práve jeden riadok, alebo kurzor.",
      "Možno použiť SELECT-INTO, ktorý vráti aspoň jeden riadok, alebo kurzor.",
      "Možno použiť ľubovoľný SQL príkaz.",
      "V PL/SQL bloku nemožno použiť žiaden SQL príkaz.",
    ],
    correct: [0],
    explanation:
      "SELECT … INTO musí vrátiť práve jeden riadok (inak NO_DATA_FOUND / TOO_MANY_ROWS); viac riadkov vyžaduje kurzor.",
  },
  {
    id: "q-cursor-def-1",
    topic: "plsql",
    kind: "mcq",
    prompt: "Čo je kurzor?",
    choices: [
      "Objekt, ktorý sprístupňuje záznamy v množine získanej príkazom SELECT.",
      "Pomocná štruktúra, v ktorej je uložený definovaný SQL príkaz.",
      "Objekt, ktorý vkladá dáta do databázy.",
      "Dočasná tabuľka používaná pri operácii spojenia.",
    ],
    correct: [0],
    explanation: "Kurzor umožňuje iterovať cez riadky, ktoré vrátil dopyt.",
  },

  // ---------------- MAZANIE / referenčná integrita ----------------
  {
    id: "q-del-person-1",
    topic: "dml",
    kind: "mcq",
    prompt:
      "Potrebujeme vymazať osobu. Z akých tabuliek a v akom poradí treba vymazať záznamy najskôr?",
    choices: [
      "b_oprava, b_porucha, b_pozicanie, b_zakaznik, b_zamestnanec, b_os_udaje",
      "žiadne z uvedených poradí nie je správne",
      "b_os_udaje, b_zamestnanec, b_zakaznik, b_pozicanie, b_porucha, b_oprava",
      "b_zamestnanec, b_zakaznik, b_os_udaje",
    ],
    correct: [0],
    explanation: "Najprv potomkov, potom rodičov — b_os_udaje (rodič) sa maže ako posledný.",
  },
  {
    id: "q-del-os-1",
    topic: "dml",
    kind: "mcq",
    prompt:
      "Pred vymazaním z b_os_udaje, z akých tabuliek treba vymazať najskôr (každá obsahuje relevantné dáta)?",
    choices: [
      "b_oprava, b_porucha, b_pozicanie, b_zakaznik, b_zamestnanec",
      "b_zakaznik, b_zamestnanec",
      "b_zamestnanec",
      "Zo žiadnej",
    ],
    correct: [0],
    explanation:
      "Najprv treba vymazať všetkých potomkov, ktorí odkazujú na osobu (priamo aj tranzitívne).",
  },
  {
    id: "q-del-park-1",
    topic: "dml",
    kind: "mcq",
    prompt:
      "Pred vymazaním parkovania z b_parkovanie, z akých tabuliek treba vymazať najskôr?",
    choices: [
      "Z b_bicykel",
      "Z b_mesto, b_stojan, b_miesto",
      "Z b_mesto, b_stojan, b_miesto, b_bicykel",
      "Zo žiadnej",
    ],
    correct: [3],
    explanation:
      "b_parkovanie je potomok; jeho rodičia ostávajú. Na parkovanie nič neodkazuje, takže ho zmažeme priamo.",
  },

  // ---------------- INTEGRITA / KĽÚČE ----------------
  {
    id: "q-refint-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Referenčná integrita hovorí:",
    choices: [
      "Hodnota FK v relácii R2 sa musí rovnať hodnote PK z relácie R1, alebo NULL.",
      "Hodnota FK v relácii R2 sa môže rovnať hodnote PK z relácie R1.",
      "FK je množina atribútov v R2, ktorá môže byť v inej relácii R1 PK alebo kandidátom PK.",
      "Hodnota FK v relácii R2 sa nemusí rovnať hodnote PK z relácie R1.",
    ],
    correct: [0],
    explanation: "Každý FK odkazuje na existujúcu hodnotu PK, alebo je NULL.",
  },
  {
    id: "q-fk-def-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Definujte cudzí kľúč (FK).",
    choices: [
      "Množina atribútov definovaná v relácii R2, ktorá môže byť v inej relácii R1 PK alebo kandidátom PK.",
      "Množina atribútov, ktorá spĺňa jednoznačnosť a minimálnosť.",
      "Atribút, ktorý určuje jednoznačnosť.",
      "Množina atribútov, ktorá je vždy NOT NULL.",
    ],
    correct: [0],
    explanation: "FK je odkaz na PK (alebo kandidáta PK) inej relácie.",
  },
  {
    id: "q-candkey-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Definujte kandidáta primárneho kľúča.",
    choices: [
      "Množina atribútov, ktorá spĺňa podmienku jednoznačnosti a minimálnosti.",
      "Atribút, ktorý určuje jednoznačnosť.",
      "Množina atribútov, ktorá spĺňa jednoznačnosť a minimálnosť a je definovaná v inej relácii.",
    ],
    correct: [0],
    explanation: "Kandidátsky kľúč = minimálna jednoznačne identifikujúca množina atribútov.",
  },
  {
    id: "q-entint-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Integrita entít sa týka:",
    choices: [
      "Len atribútov primárneho kľúča.",
      "Všetkých NOT NULL atribútov.",
      "Len atribútov primárneho alebo cudzieho kľúča.",
      "Atribútov primárneho a cudzieho kľúča.",
    ],
    correct: [3],
    explanation:
      "Podľa kľúča zo skúšky je odpoveď viazaná na PK (a jeho vzťah k FK). Pozn.: v striktnej definícii ide len o PK (PK nesmie byť NULL).",
  },
  {
    id: "q-degree-zero-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Kedy môže byť stupeň relácie rovný nule?",
    choices: [
      "Keď relácia neobsahuje žiadne atribúty (stĺpce).",
      "Keď relácia neobsahuje žiadne riadky.",
      "Keď relácia nemá primárny kľúč.",
      "Stupeň nikdy nemôže byť nula.",
    ],
    correct: [0],
    explanation: "Stupeň = počet atribútov; nula znamená reláciu bez stĺpcov.",
  },
  {
    id: "q-bcnf-prop-1",
    topic: "normalization",
    kind: "mcq",
    prompt: "Čo platí pre BCNF?",
    choices: [
      "Každý determinant je kpk (kandidát PK).",
      "Ak je atribút superkľúčom, musí byť determinantom.",
      "Každý kpk je determinant.",
      "Každý determinant je superkľúčom alebo kandidátom PK.",
    ],
    correct: [3],
    explanation:
      "BCNF: každý determinant je superkľúč (ekvivalentne kandidát PK).",
  },
  {
    id: "q-3nf-bcnf-1",
    topic: "normalization",
    kind: "mcq",
    prompt: "Ak je relácia v 3NF, je nutne aj v BCNF?",
    choices: [
      "Nie — BCNF je striktne silnejšia; relácia v 3NF nemusí byť v BCNF (prekrývajúce sa zložené kandidáty PK).",
      "Áno — 3NF vždy implikuje BCNF.",
    ],
    correct: [0],
    explanation:
      "BCNF vyžaduje, aby každý determinant bol kandidátom PK; 3NF niektoré pripúšťa.",
  },
  {
    id: "q-2nf-check-1",
    topic: "normalization",
    kind: "mcq",
    prompt:
      "Je relácia v 2NF? Závislosti: A → B; (A,C) → D (kandidát PK je (A,C)).",
    choices: [
      "Nie — A→B je parciálna závislosť na časti kľúča; treba dekomponovať.",
      "Áno — všetky atribúty závisia od kľúča.",
    ],
    correct: [0],
    explanation:
      "B závisí len od A (časti kľúča (A,C)) → parciálna závislosť → nie je v 2NF. Dekompozícia: R1(A,B), R2(A,C,D).",
  },
  {
    id: "q-triv-fd-1",
    topic: "normalization",
    kind: "mcq",
    prompt: "O aký typ funkčnej závislosti ide: (A,B) → A?",
    choices: ["Triviálna", "Tranzitívna", "Parciálna", "Vzájomná"],
    correct: [0],
    explanation: "Pravá strana (A) je podmnožinou ľavej (A,B) → triviálna FZ.",
  },
  {
    id: "q-reln-props-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Vymenujte vlastnosti relácie.",
    choices: [
      "ANNU — Atomické hodnoty, Neusporiadanosť riadkov, Neusporiadanosť stĺpcov, Unikátnosť riadkov.",
      "ACID — atomickosť, konzistencia, izolácia, trvácnosť.",
      "CRUDE — stĺpcová, referenčná, používateľská, doménová, entitná.",
    ],
    correct: [0],
    explanation:
      "Vlastnosti relácie sú ANNU. ACID popisuje transakcie; CRUD(E) operácie nad dátami.",
  },
  {
    id: "q-addr-attr-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Atribút ADRESA(ŠTÁT, OBEC, ULICA, PSČ) je:",
    choices: ["skupinový atribút", "determinant", "rekurzívny atribút", "atomický atribút"],
    correct: [0],
    explanation:
      "Skladá sa z viacerých zložiek → skupinový (kompozitný) atribút; nie je atomický.",
  },

  // ---------------- ERA MODELOVANIE ----------------
  {
    id: "q-er-pen-1",
    topic: "er-modeling",
    kind: "mcq",
    prompt:
      "Študent musí mať aspoň jedno pero a pero patrí práve jednému študentovi. O aký vzťah ide?",
    choices: [
      "Povinné členstvo entít, kardinalita 1:1",
      "Nepovinné členstvo entít, kardinalita 1:1",
      "Povinné členstvo entít, kardinalita 1:N",
      "Nepovinné členstvo entít, kardinalita 1:N",
    ],
    correct: [2],
    explanation: "Obe entity musia participovať (povinné) a jeden študent má viac pier → 1:N.",
  },
  {
    id: "q-er-t1t2-1",
    topic: "er-modeling",
    kind: "mcq",
    prompt:
      "create table t1(id integer primary key); create table t2(id integer, hodnota integer, primary key(id,hodnota)), kde id odkazuje na t1. O aký vzťah ide?",
    choices: [
      "Identifikačný, kardinalita 1:N",
      "Neidentifikačný, kardinalita 1:N",
      "Identifikačný, kardinalita 1:1",
      "Neidentifikačný, kardinalita 1:1",
    ],
    correct: [0],
    explanation: "FK id je súčasťou PK tabuľky t2 → identifikačný; jedno t1 k viacerým t2 → 1:N.",
  },
  {
    id: "q-er-t1t2-2",
    topic: "er-modeling",
    kind: "mcq",
    prompt:
      "t1(id PK, nazov); t2(id PK); ALTER TABLE t2 ADD FOREIGN KEY (id) REFERENCES t1. O aký vzťah ide?",
    choices: [
      "Identifikačný, 1:N",
      "Neidentifikačný, 1:N",
      "Identifikačný, 1:1",
      "Neidentifikačný, 1:1",
    ],
    correct: [2],
    explanation:
      "PK tabuľky t2 je zároveň FK (zdieľaný kľúč 1:1) → identifikačný, 1:1.",
  },
  {
    id: "q-er-zakaznik-1",
    topic: "er-modeling",
    kind: "mcq",
    prompt:
      "Zakaznik(id PK); Objednavka(id PK, zakaznik_id, datum, FK zakaznik_id → Zakaznik(id)). O aký typ vzťahu ide?",
    choices: [
      "Neidentifikačný 1:N, nepovinné členstvo",
      "Neidentifikačný 1:N, povinné členstvo",
      "Identifikačný 1:N, povinné členstvo",
      "Identifikačný M:N, povinné členstvo",
    ],
    correct: [1],
    explanation:
      "FK je mimo PK objednávky → neidentifikačný; jeden zákazník k viacerým objednávkam, FK povinný → povinné 1:N.",
  },
  {
    id: "q-er-mn-1",
    topic: "er-modeling",
    kind: "mcq",
    prompt: "Vzťah s kardinalitou M:N v relačnom modeli vyžaduje:",
    choices: [
      "Väzobnú (vzťahovú) tabuľku so zloženým kľúčom.",
      "Iba jeden cudzí kľúč v jednej z tabuliek.",
      "Žiadnu zmenu — M:N sa modeluje priamo.",
      "Pohľad (view).",
    ],
    correct: [0],
    explanation:
      "M:N sa rozkladá cez väzobnú tabuľku, ktorej PK tvoria PFK z oboch entít.",
  },
  {
    id: "q-er-notnull-1",
    topic: "er-modeling",
    kind: "mcq",
    prompt: "Ak je cudzí kľúč definovaný ako NOT NULL, znamená to:",
    choices: [
      "Povinné členstvo vo vzťahu.",
      "Nepovinné členstvo vo vzťahu.",
      "Identifikačný vzťah.",
      "Kardinalitu M:N.",
    ],
    correct: [0],
    explanation: "NOT NULL FK znamená, že vždy musí mať hodnotu → povinné členstvo.",
  },

  // ---------------- MNOŽINOVÉ OPERÁCIE / UNION ----------------
  {
    id: "q-union-1",
    topic: "relational-algebra",
    kind: "mcq",
    prompt:
      "Ktorá množina je union-kompatibilná s: SELECT id_porucha, id_bicykel, id_zakaznik, nahlasenie?",
    choices: [
      "SELECT id_porucha, id_bicykel, 241, to_date('20.05.2020','DD.MM.RRRR')",
      "SELECT id_porucha, sysdate, id_bicykel, 2808",
      "Ani jedna z uvedených",
      "SELECT 2808, 241, 1998",
    ],
    correct: [0],
    explanation:
      "Rovnaký počet stĺpcov s rovnakými doménami v poradí; možnosť d má len 3 stĺpce.",
  },
  {
    id: "q-union-2",
    topic: "relational-algebra",
    kind: "mcq",
    prompt:
      "Ktorá množina je union-kompatibilná s: SELECT id_zakaznik, rod_cislo, od, do?",
    choices: [
      "SELECT 2808, rod_cislo, to_date('20.05.2020','DD.MM.RRRR'), NULL",
      "Ani jedna z uvedených",
      "SELECT rod_cislo, to_date('01.01.2020','DD.MM.RRRR'), sysdate",
      "SELECT '123456/1234', 112233, sysdate+22, NULL",
    ],
    correct: [0],
    explanation:
      "Štyri stĺpce zhodných typov/pozícií (číslo, rod_cislo, dátum, dátum/NULL).",
  },
  {
    id: "q-union-3",
    topic: "relational-algebra",
    kind: "mcq",
    prompt: "Ktorá množina je union-kompatibilná s: SELECT rod_cislo, meno, priezvisko?",
    choices: [
      "SELECT * FROM (select rod_cislo as RC, meno, priezvisko as priezv)",
      "SELECT meno, priezvisko, rod_cislo",
      "SELECT meno, priezvisko, NULL",
      "SELECT rod_cislo, meno, priezvisko, NULL",
    ],
    correct: [2],
    explanation:
      "Tri stĺpce kompatibilných domén; možnosť d má štyri stĺpce, ostatné menia poradie typov.",
  },
  {
    id: "q-unary-ops-1",
    topic: "relational-algebra",
    kind: "mcq",
    prompt: "Vymenujte dve unárne operácie relačnej algebry.",
    choices: [
      "Výber (σ) a projekcia (π)",
      "Kartézsky súčin a prienik",
      "Zjednotenie a rozdiel",
      "Spojenie a delenie",
    ],
    correct: [0],
    explanation: "Výber a projekcia pracujú s jednou reláciou; ostatné sú binárne.",
  },

  // ---------------- DB POJMY ----------------
  {
    id: "q-dbms-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Systém riadenia bázy dát (SRBD/DBMS) je:",
    choices: [
      "Programové vybavenie pre definíciu dát a manipuláciu s dátami.",
      "Popis dátového modelu a dáta.",
      "Aplikačné programové vybavenie.",
    ],
    correct: [0],
    explanation: "DBMS je softvérová vrstva, ktorá definuje a manipuluje s dátami.",
  },
  {
    id: "q-database-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Databáza je:",
    choices: [
      "Množina perzistentných dát.",
      "Systém riadenia bázy dát a databáza.",
      "Programové vybavenie pre definíciu a manipuláciu s dátami.",
    ],
    correct: [0],
    explanation: "Samotná databáza sú perzistentné dáta; DBMS je samostatný.",
  },
  {
    id: "q-dbsystem-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Databázový systém je:",
    choices: [
      "Systém riadenia bázy a dát (DBMS + databáza).",
      "Množina perzistentných dát.",
      "Programové vybavenie pre definíciu a manipuláciu s dátami.",
    ],
    correct: [0],
    explanation: "Databázový systém = DBMS spolu s databázou.",
  },
  {
    id: "q-phys-indep-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Fyzická nezávislosť dát je:",
    choices: [
      "Nezávislosť programov na organizácii dát a prístupových metódach.",
      "Nezávislosť programov na konceptuálnom modeli.",
      "Nezávislosť definície dát na konceptuálnom modeli.",
    ],
    correct: [0],
    explanation:
      "Fyzická nezávislosť oddeľuje programy od zmien uloženia/prístupu.",
  },
  {
    id: "q-log-indep-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Logická nezávislosť dát je:",
    choices: [
      "Nezávislosť dátového modelu na programe.",
      "Nezávislosť dát od prístupových metód.",
      "Nezávislosť programu od organizácie dát.",
    ],
    correct: [0],
    explanation:
      "Logická nezávislosť oddeľuje programy od zmien logickej schémy.",
  },
  {
    id: "q-share-1",
    topic: "integrity",
    kind: "mcq",
    prompt: "Zdieľateľnosť dát je:",
    choices: [
      "Dáta môžu používať viaceré aplikácie súčasne alebo sekvenčne.",
      "Dáta môžu byť použité práve raz v aplikácii.",
      "Dáta môžu byť uložené vo viacerých tabuľkách.",
    ],
    correct: [0],
    explanation: "Tie isté dáta môže zdieľať viacero aplikácií.",
  },

  // ---------------- PÍSOMNÉ OTÁZKY ----------------
  {
    id: "w-acid-1",
    topic: "transactions",
    kind: "written",
    prompt: "Popíšte vlastnosti transakcie (ACID).",
    keywords: ["atomick", "konzist", "izol", "trvác"],
    modelAnswer:
      "ACID: Atomickosť — transakcia prebehne úplne, alebo vôbec (pri chybe rollback). Konzistencia — prevedie DB z jedného platného stavu do druhého, dodrží všetky obmedzenia. Izolácia — súbežné transakcie sa neovplyvňujú; výsledok zodpovedá nejakému sériovému poradiu. Trvácnosť — po commite zmeny pretrvajú aj po výpadku.",
  },
  {
    id: "w-bcnf-1",
    topic: "normalization",
    kind: "written",
    prompt:
      "Uveďte podmienku BCNF a vysvetlite, či relácia v 3NF musí byť aj v BCNF.",
    keywords: ["determinant", "kandid", "kľúč", "3nf", "silnej"],
    modelAnswer:
      "Relácia je v BCNF práve vtedy, keď každý determinant je kandidátom na primárny kľúč. BCNF je silnejšia ako 3NF: relácia môže byť v 3NF a nie v BCNF (typicky pri prekrývajúcich sa zložených kandidátoch PK). Každá BCNF relácia je v 3NF, opačne nie.",
  },
  {
    id: "w-determinants-1",
    topic: "normalization",
    kind: "written",
    prompt: "Pre (A,B) → C a C → D uveďte všetky determinanty a prípadnú tranzitívnu závislosť.",
    keywords: ["(a,b)", "c", "tranzit", "d"],
    modelAnswer:
      "Determinanty: (A,B) a C. Keďže (A,B)→C a C→D, existuje tranzitívna závislosť (A,B)→D.",
  },
  {
    id: "w-determinants-2",
    topic: "normalization",
    kind: "written",
    prompt: "Určte determinanty: D → C; (A,B) → D; C → D.",
    keywords: ["d", "(a,b)", "c"],
    modelAnswer:
      "Determinanty: D (D→C), (A,B) ((A,B)→D) a C (C→D). Navyše D↔C sú vzájomne závislé (D→C aj C→D).",
  },
  {
    id: "w-trigger-bike-1",
    topic: "plsql",
    kind: "written",
    prompt:
      "Napíšte trigger, ktorý zabráni požičať bicykel, ktorý je aktuálne v oprave.",
    keywords: ["before", "insert", "b_pozicanie", "for each row", "count", "do is null", "raise_application_error"],
    modelAnswer:
      "CREATE OR REPLACE TRIGGER nepozicaj_pokazeny BEFORE INSERT OR UPDATE ON b_pozicanie FOR EACH ROW DECLARE v_count INTEGER; BEGIN SELECT COUNT(*) INTO v_count FROM b_oprava WHERE id_bicykel = :NEW.id_bicykel AND do IS NULL; IF v_count > 0 THEN RAISE_APPLICATION_ERROR(-20001,'Bicykel je v oprave.'); END IF; END;",
  },
  {
    id: "w-trigger-poistenie-1",
    topic: "plsql",
    kind: "written",
    prompt:
      "Napíšte trigger, ktorým zabezpečíte, že nový poistný záznam (p_poistenie) sa nedá vytvoriť, ak osoba už má aktívne poistenie.",
    keywords: ["before", "insert", "p_poistenie", "for each row", "count", "dat_do is null", "raise_application_error"],
    modelAnswer:
      "CREATE OR REPLACE TRIGGER kontrola_aktivneho BEFORE INSERT ON p_poistenie FOR EACH ROW DECLARE v_count NUMBER; BEGIN SELECT COUNT(*) INTO v_count FROM p_poistenie WHERE rod_cislo = :NEW.rod_cislo AND dat_do IS NULL; IF v_count > 0 THEN RAISE_APPLICATION_ERROR(-20001,'Osoba má už aktívne poistenie.'); END IF; END;",
  },
  {
    id: "w-trigger-bank-1",
    topic: "plsql",
    kind: "written",
    prompt:
      "Napíšte trigger, ktorý zabezpečí, že po pripočítaní novej transakcie nesmie byť zostatok účtu záporný.",
    keywords: ["before", "insert", "for each row", "sum", "id_uctu", "< 0", "raise_application_error"],
    modelAnswer:
      "CREATE OR REPLACE TRIGGER nezaporny_zostatok BEFORE INSERT ON transakcia FOR EACH ROW DECLARE v_sum NUMBER; BEGIN SELECT NVL(SUM(suma),0) INTO v_sum FROM transakcia WHERE id_uctu = :NEW.id_uctu; IF v_sum + :NEW.suma < 0 THEN RAISE_APPLICATION_ERROR(-20002,'Zostatok by bol zaporny.'); END IF; END;",
  },
  {
    id: "w-trigger-3-prispevky",
    topic: "plsql",
    kind: "written",
    prompt:
      "Napíšte trigger, ktorý zabezpečí, aby poberateľ nemal evidovaných viac ako 3 príspevky v rovnakom mesiaci.",
    keywords: ["before", "insert", "for each row", "count", "trunc", "obdobie", "3", "raise_application_error"],
    modelAnswer:
      "BEFORE INSERT ON p_prispevky FOR EACH ROW: SELECT COUNT(*) INTO v FROM p_prispevky WHERE id_poberatela = :NEW.id_poberatela AND TRUNC(obdobie,'MM') = TRUNC(:NEW.obdobie,'MM'); IF v >= 3 THEN RAISE_APPLICATION_ERROR(-20001,'Max 3 prispevky v mesiaci.'); END IF;",
  },
  {
    id: "w-trigger-5-subjects",
    topic: "plsql",
    kind: "written",
    prompt:
      "Napíšte trigger, ktorý zabezpečí, že študent môže mať zapísaných najviac 5 predmetov.",
    keywords: ["before", "insert", "for each row", "count", "5", "raise_application_error"],
    modelAnswer:
      "BEFORE INSERT ON zapis FOR EACH ROW: SELECT COUNT(*) INTO v FROM zapis WHERE id_student = :NEW.id_student; IF v >= 5 THEN RAISE_APPLICATION_ERROR(-20001,'Max 5 predmetov.'); END IF;",
  },
  {
    id: "w-trigger-zakaz-typ",
    topic: "plsql",
    kind: "written",
    prompt:
      "Vytvorte trigger, ktorý zakáže vymazať typ príspevku, ak existuje aspoň jeden poberateľ tohto typu.",
    keywords: ["before", "delete", "p_typ_prispevku", "for each row", "count", "raise_application_error"],
    modelAnswer:
      "CREATE OR REPLACE TRIGGER zakaz_zmazat BEFORE DELETE ON p_typ_prispevku FOR EACH ROW DECLARE v NUMBER; BEGIN SELECT COUNT(*) INTO v FROM p_poberatel WHERE id_typu = :OLD.id_typu; IF v > 0 THEN RAISE_APPLICATION_ERROR(-20001,'Typ ma poberatelov.'); END IF; END;",
  },
  {
    id: "w-proc-ukonci-poistenie",
    topic: "plsql",
    kind: "written",
    prompt:
      "Vytvorte procedúru, ktorá ukončí všetky poistenia osoby podľa zadaného rodného čísla (nastaví dat_do na dnešný deň).",
    keywords: ["procedure", "update", "p_poistenie", "dat_do", "sysdate", "rod_cislo"],
    modelAnswer:
      "CREATE OR REPLACE PROCEDURE ukonci_poistenie (p_rc IN p_osoba.rod_cislo%TYPE) IS BEGIN UPDATE p_poistenie SET dat_do = SYSDATE WHERE rod_cislo = p_rc AND dat_do IS NULL; END;",
  },
  {
    id: "w-func-roky-poistenia",
    topic: "plsql",
    kind: "written",
    prompt:
      "Napíšte funkciu, ktorá vráti počet rokov, počas ktorých bola osoba poistená.",
    keywords: ["function", "return", "months_between", "12", "p_poistenie", "rod_cislo"],
    modelAnswer:
      "CREATE OR REPLACE FUNCTION roky_poistenia (p_rc IN p_poistenie.rod_cislo%TYPE) RETURN NUMBER IS roky NUMBER; BEGIN SELECT SUM(MONTHS_BETWEEN(NVL(dat_do,SYSDATE), dat_od))/12 INTO roky FROM p_poistenie WHERE rod_cislo = p_rc; RETURN roky; END;",
  },
  {
    id: "w-proc-call-1",
    topic: "plsql",
    kind: "written",
    prompt:
      "Procedúra p_test(id integer, vysledok OUT integer). Napíšte kód, ktorým ju zavoláte s parametrom 4 v anonymnom bloku.",
    keywords: ["declare", "begin", "p_test(4", "end"],
    modelAnswer:
      "DECLARE v_vysledok INTEGER; BEGIN p_test(4, v_vysledok); END; / -- vnútri bloku sa volá bez kľúčového slova EXEC",
  },
  {
    id: "w-seq-1",
    topic: "sequences",
    kind: "written",
    prompt: "Ako získate aktuálnu a ďalšiu hodnotu zo sekvencie s?",
    keywords: ["nextval", "currval"],
    modelAnswer:
      "Ďalšia hodnota: s.NEXTVAL (posunie sekvenciu). Aktuálna: s.CURRVAL (posledná hodnota z NEXTVAL v rámci tejto session; NEXTVAL treba zavolať aspoň raz predtým).",
  },
  {
    id: "w-date-add-1",
    topic: "functions",
    kind: "written",
    prompt: "K aktuálnemu dátumu a času pripočítajte 5 hodín, 30 minút a 10 sekúnd.",
    keywords: ["sysdate", "24", "1440", "86400"],
    modelAnswer: "SELECT SYSDATE + 5/24 + 30/1440 + 10/86400 FROM dual;",
  },
  {
    id: "w-check-range-1",
    topic: "constraints",
    kind: "written",
    prompt:
      "Pridajte obmedzenie, aby celočíselný atribút `mnozstvo` v tabuľke `nakup` mohol byť len 1–255.",
    keywords: ["alter", "check", "between", "1", "255"],
    modelAnswer:
      "ALTER TABLE nakup ADD CONSTRAINT chk_mnozstvo CHECK (mnozstvo BETWEEN 1 AND 255);",
  },
  {
    id: "w-check-suma",
    topic: "constraints",
    kind: "written",
    prompt: "Zabezpečte, že suma v p_prispevky nemôže byť záporná.",
    keywords: ["alter", "check", "suma", ">= 0"],
    modelAnswer:
      "ALTER TABLE p_prispevky ADD CONSTRAINT chk_suma CHECK (suma >= 0);",
  },
  {
    id: "w-add-pk",
    topic: "ddl",
    kind: "written",
    prompt:
      "Definujte (cez kód) primárny kľúč pre tabuľku p_zamestnanec ako kombináciu (rod_cislo, dat_od).",
    keywords: ["alter", "add", "primary key", "rod_cislo", "dat_od"],
    modelAnswer:
      "ALTER TABLE p_zamestnanec ADD CONSTRAINT pk_p_zamestnanec PRIMARY KEY (rod_cislo, dat_od);",
  },
  {
    id: "w-allregions-1",
    topic: "joins",
    kind: "written",
    prompt:
      "Vypíšte všetky kraje a k nim mestá vrátane krajov, ku ktorým neexistuje žiadne mesto.",
    keywords: ["left join", "kraj", "mesto", "okres"],
    modelAnswer:
      "SELECT k.n_kraja, m.n_mesta FROM p_kraj k LEFT JOIN p_okres o ON o.id_kraja = k.id_kraja LEFT JOIN p_mesto m ON m.id_okresu = o.id_okresu;",
  },
  {
    id: "w-union-poistenci-1",
    topic: "relational-algebra",
    kind: "written",
    prompt:
      "Vyberte všetkých poistencov a všetkých poberateľov a spojte ich množinovou operáciou.",
    keywords: ["union", "select"],
    modelAnswer:
      "SELECT rod_cislo FROM p_poistenie UNION SELECT rod_cislo FROM p_poberatel;",
  },
  {
    id: "w-antijoin-1",
    topic: "joins",
    kind: "written",
    prompt:
      "Pre model sociálnej poisťovne uveďte príklad použitia operácie ANTI JOIN.",
    keywords: ["not exists", "not in", "p_osoba", "p_poistenie"],
    modelAnswer:
      "Osoby, ktoré nie sú poistené: SELECT * FROM p_osoba o WHERE NOT EXISTS (SELECT 1 FROM p_poistenie p WHERE p.rod_cislo = o.rod_cislo); — ANTI JOIN vráti ľavé riadky bez zhody.",
  },
  {
    id: "w-cartesian-1",
    topic: "relational-algebra",
    kind: "written",
    prompt:
      "Pre model sociálnej poisťovne definujte príklad kartézskeho súčinu.",
    keywords: ["kart", "kombin", "p_osoba", "p_mesto"],
    modelAnswer:
      "Kartézsky súčin p_osoba × p_mesto sú všetky možné kombinácie každej osoby s každým mestom (bez spojovacej podmienky): SELECT * FROM p_osoba, p_mesto;",
  },
  {
    id: "w-degree-1",
    topic: "integrity",
    kind: "written",
    prompt:
      "Tabuľka b_zamestnanec má 24 záznamov. Aký je stupeň relácie? Zdôvodnite.",
    keywords: ["stupe", "atrib", "stĺp", "riad", "kardinal"],
    modelAnswer:
      "Stupeň = počet atribútov (stĺpcov), nie riadkov. Číslo 24 je kardinalita (počet n-tíc). Stupeň závisí od počtu stĺpcov tabuľky.",
  },
  {
    id: "w-cardinality-1",
    topic: "integrity",
    kind: "written",
    prompt: "Definujte pojem kardinalita relácie.",
    keywords: ["počet", "n-t", "riad"],
    modelAnswer:
      "Kardinalita relácie je počet n-tíc (riadkov) v tabuľke.",
  },
  {
    id: "w-fk-count-degree",
    topic: "integrity",
    kind: "written",
    prompt: "Koľko cudzích kľúčov má relácia, keď jej stupeň je 2? Zdôvodnite.",
    keywords: ["stupe", "atrib", "nevyplýva", "0"],
    modelAnswer:
      "Stupeň 2 znamená len 2 atribúty; počet cudzích kľúčov z toho nevyplýva — môže ich byť 0, 1 alebo 2 podľa návrhu schémy.",
  },
  {
    id: "w-natural-join-1",
    topic: "joins",
    kind: "written",
    prompt:
      "Uveďte príklad, kde je vhodný NATURAL JOIN, a vysvetlite prečo.",
    keywords: ["natural", "spoloč", "stĺp", "rod_cislo"],
    modelAnswer:
      "Keď dve tabuľky zdieľajú práve spojovacie stĺpce, napr. p_osoba a p_poistenie cez rod_cislo: `p_osoba NATURAL JOIN p_poistenie` spojí cez rod_cislo a zobrazí ho raz, bez duplicitných kľúčových stĺpcov.",
  },
  {
    id: "w-isa-1",
    topic: "er-modeling",
    kind: "written",
    prompt: "Čo je ISA (is-a) hierarchia?",
    keywords: ["podtyp", "nadtyp", "ded", "špecial", "general"],
    modelAnswer:
      "ISA hierarchia modeluje špecializáciu/generalizáciu: nadtyp (napr. OSOBA) má podtypy (ZAMESTNANEC, POBERATEL), ktoré dedia jeho atribúty a identifikátor a pridávajú vlastné. Každý podtyp 'je' druhom nadtypu.",
  },
  {
    id: "w-fk-null-1",
    topic: "constraints",
    kind: "written",
    prompt:
      "Aké vlastnosti musí mať vzťah, aby mohol byť cudzí kľúč ohraničený aj hodnotou NULL?",
    keywords: ["nepovinn", "not null", "pk"],
    modelAnswer:
      "Členstvo musí byť nepovinné: FK nesmie byť definovaný ako NOT NULL a nesmie byť súčasťou primárneho kľúča (teda neidentifikačný, nepovinný vzťah). Potom môže nadobúdať NULL.",
  },
  {
    id: "w-bcnf-check-1",
    topic: "normalization",
    kind: "written",
    prompt:
      "Pre R(Student, Predmet, Ucitel) s Ucitel→Predmet (učiteľ učí jeden predmet) a (Student,Predmet)→Ucitel: nájdite kandidátov PK, determinanty, rozhodnite o BCNF a dekomponujte, ak treba.",
    keywords: ["kandid", "determinant", "ucitel", "predmet", "dekompoz", "bcnf"],
    modelAnswer:
      "Kandidáti PK: (Student,Predmet) a (Student,Ucitel). Determinanty: (Student,Predmet), (Student,Ucitel) a Ucitel. Ucitel je determinant, ale NIE je kandidátom PK → nie je v BCNF (hoci je v 3NF). Bezstratová BCNF dekompozícia: R1(Ucitel, Predmet) a R2(Student, Ucitel).",
  },
  {
    id: "w-2nf-decomp-1",
    topic: "normalization",
    kind: "written",
    prompt: "Je relácia v 2NF? A → B; (A,C) → D. Ak nie, navrhnite dekompozíciu.",
    keywords: ["nie", "parciál", "r1", "r2", "a", "c"],
    modelAnswer:
      "Nie — B závisí len od A (časti zloženého kľúča (A,C)), čo je parciálna závislosť. Dekompozícia do 2NF: R1(A(PK), B) a R2(A(FK), C, D) s PK (A,C).",
  },
  {
    id: "w-savepoint-1",
    topic: "transactions",
    kind: "written",
    prompt: "Na čo slúži SAVEPOINT a ako sa používa pri transakcii?",
    keywords: ["bod", "rollback to", "vrát", "commit"],
    modelAnswer:
      "SAVEPOINT vytvorí pomenovaný bod návratu v transakcii. ROLLBACK TO savepoint zruší len prácu po tomto bode, skoršia práca ostáva; následný COMMIT natrvalo uloží to, čo zostalo.",
  },
];

export const QUESTION_MAP: Record<string, QuizQuestion> = Object.fromEntries(
  QUESTIONS.map((q) => [q.id, q]),
);
