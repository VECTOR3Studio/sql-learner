import type { Lesson } from "@/types";

// Lekcie sú predpripravené zo skúškových materiálov. Spustiteľné príklady (lang
// "sql", bez oracleOnly) používajú schému SOCIÁLNEJ POISŤOVNE (p_ tabuľky), aby
// sa dali skopírovať priamo do sandboxu. Oracle-only príklady (PL/SQL, sekvencie,
// SYSDATE, FETCH FIRST, WITH CHECK OPTION…) sú len na ukážku.

export const LESSONS: Lesson[] = [
  // ---------------------------------------------------------------- SELECT
  {
    id: "select-basics",
    topic: "select",
    title: "SELECT, WHERE, ORDER BY, DISTINCT, FETCH FIRST",
    summary:
      "Projekcia a selekcia: vyber stĺpce, filtruj riadky, zoraď, odstráň duplicity a obmedz počet výsledkov po oracleovsky.",
    keyPoints: [
      "SELECT = projekcia (stĺpce), WHERE = selekcia (riadky).",
      "DISTINCT odstráni duplicitné riadky z výsledku.",
      "Oracle obmedzuje riadky cez FETCH FIRST n ROWS ONLY (12c+) alebo ROWNUM (staršie).",
      "NULL sa nikdy nerovná ničomu — používaj IS NULL / IS NOT NULL, nikdy = NULL.",
    ],
    sections: [
      {
        heading: "Tvar dopytu",
        body: [
          "Klauzuly sa píšu v poradí: SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY. Vyhodnocujú sa zhruba FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY, preto sa alias zo SELECT dá použiť v ORDER BY, ale nie vo WHERE.",
        ],
        code: [
          {
            label: "Poberatelia a počet ich príspevkov",
            lang: "sql",
            code:
              "SELECT pb.id_poberatela, COUNT(p.obdobie) AS pocet_prispevkov\nFROM p_poberatel pb\nLEFT JOIN p_prispevky p USING (id_poberatela)\nGROUP BY pb.id_poberatela;",
          },
        ],
      },
      {
        heading: "Práca s NULL",
        body: [
          "Porovnanie s NULL dáva UNKNOWN, nie TRUE. `WHERE dat_do != NULL` nevráti nič — správny tvar je `WHERE dat_do IS NOT NULL`. Klasická chyta na skúške.",
        ],
        code: [
          {
            label: "Zle vs správne (aktívne poistenia)",
            lang: "sql",
            code:
              "-- ZLE: nevráti žiaden riadok\nSELECT * FROM p_poistenie WHERE dat_do != NULL;\n\n-- SPRÁVNE: aktívne poistenia\nSELECT * FROM p_poistenie WHERE dat_do IS NULL;",
          },
        ],
      },
      {
        heading: "Obmedzenie počtu riadkov (Oracle)",
        body: [
          "Oracle používa FETCH FIRST n ROWS ONLY spolu s ORDER BY pre top-N. Staršie kódy používajú pseudostĺpec ROWNUM. SQLite (sandbox) používa LIMIT — na ten rozdiel pozor.",
        ],
        code: [
          {
            label: "Osoba s najvyšším odvodom (top-1)",
            lang: "plsql",
            oracleOnly: true,
            code:
              "SELECT id_poistenca, SUM(suma) AS spolu\nFROM p_odvod_platba\nGROUP BY id_poistenca\nORDER BY SUM(suma) DESC\nFETCH FIRST 1 ROW ONLY;",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- JOINS
  {
    id: "joins",
    topic: "joins",
    title: "Spojenia: INNER, OUTER, USING/ON, NATURAL, SEMI/ANTI",
    summary:
      "Spájaj riadky z viacerých tabuliek a presne uvažuj, koľko riadkov sa vráti — jadro väčšiny skúškových SQL.",
    keyPoints: [
      "INNER JOIN zachová len zhodné riadky; LEFT/RIGHT/FULL OUTER zachovajú aj nezhodné s NULL.",
      "USING(stlpec) spojí cez rovnomenné stĺpce a zlúči ich do jedného; ON umožní ľubovoľnú podmienku.",
      "Počet riadkov A LEFT JOIN B = (zhodné páry) + (nezhodné riadky A).",
      "WHERE na stĺpci z OUTER spojenia môže ticho zmeniť OUTER späť na INNER.",
    ],
    sections: [
      {
        heading: "OUTER spojenia zachovajú nezhodné riadky",
        body: [
          "Aby sme vypísali každú osobu a jej poistenia AJ osoby bez poistenia, LEFT JOIN zachová ľavé (p_osoba) riadky aj keď žiadne poistenie nesedí.",
        ],
        code: [
          {
            label: "Každá osoba + jej poistenia (vrátane nepoistených)",
            lang: "sql",
            code:
              "SELECT o.rod_cislo, o.priezvisko, p.id_poistenca, p.dat_od, p.dat_do\nFROM p_osoba o\nLEFT JOIN p_poistenie p USING (rod_cislo)\nORDER BY o.rod_cislo;",
          },
          {
            label: "Všetky kraje a ich mestá (aj kraje bez miest)",
            lang: "sql",
            code:
              "SELECT k.n_kraja, m.n_mesta\nFROM p_kraj k\nLEFT JOIN p_okres o ON o.id_kraja = k.id_kraja\nLEFT JOIN p_mesto m ON m.id_okresu = o.id_okresu\nORDER BY k.n_kraja, m.n_mesta;",
          },
        ],
      },
      {
        heading: "Počítanie riadkov cez spojenie (obľúbené na skúške)",
        body: [
          "OPRAVA(1000, 250 prebieha) RIGHT JOIN PORUCHA(1000, len 600 napojených, všetky ukončené) s `WHERE do IS NOT NULL` → 600: pravá strana zachová všetkých 1000 porúch, no iba 600 napojených na ukončenú opravu spĺňa `do IS NOT NULL`.",
          "MIESTO JOIN PARKOVANIE USING(id_miesto, id_stojan) s 300 parkovaniami → 300: vnútorné spojenie vytvorí presne jeden riadok na zhodný pár.",
          "ZAKAZNIK(100) RIGHT JOIN OS_UDAJE(200) USING(rod_cislo) → presne 200: každý riadok os_udaje sa zachová; zhodné nesú stĺpce zákazníka, ostatné sú NULL.",
        ],
      },
      {
        heading: "NATURAL JOIN & SEMI/ANTI",
        body: [
          "NATURAL JOIN automaticky spojí cez všetky rovnomenné stĺpce a zobrazí ich raz — vhodné, keď dve tabuľky zdieľajú práve kľúčový stĺpec, napr. p_osoba ⋈ p_poistenie cez rod_cislo.",
          "SEMI JOIN vráti ľavé riadky s aspoň jednou zhodou (EXISTS/IN). ANTI JOIN vráti ľavé riadky bez zhody (NOT EXISTS / NOT IN) — napr. osoby bez poistenia.",
        ],
        code: [
          {
            label: "Anti-join: osoby, ktoré nie sú poistené",
            lang: "sql",
            code:
              "SELECT o.rod_cislo, o.priezvisko\nFROM p_osoba o\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poistenie p\n  WHERE p.rod_cislo = o.rod_cislo AND p.dat_do IS NULL\n);",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- SUBQUERIES
  {
    id: "subqueries",
    topic: "subqueries",
    title: "Vnorené dopyty: IN, EXISTS, korelované, vnorené agregácie",
    summary:
      "Dopyt vnútri dopytu pre testy členstva, kontrolu existencie a vzor „maximum z počtov“.",
    keyPoints: [
      "NOT IN zlyhá, ak vnorený dopyt vráti čo i len jeden NULL — preferuj NOT EXISTS.",
      "EXISTS sa zastaví pri prvej zhode; ideálne na otázky „má aspoň jeden …“.",
      "Korelované vnorené dopyty odkazujú na vonkajší riadok (napr. WHERE o.rod_cislo = p.rod_cislo).",
      "„Mesto s najviac X“ používa HAVING COUNT(*) = (SELECT MAX(cnt) FROM (… GROUP BY …)).",
    ],
    sections: [
      {
        heading: "NOT EXISTS pre „žiadny z“",
        body: [
          "Na vymazanie typov príspevkov, ktoré nikto nikdy nepoberal, je NOT EXISTS bezpečné aj keď cudzie kľúče obsahujú NULL.",
        ],
        code: [
          {
            label: "Typy, ktoré sa nikdy nepoužili",
            lang: "sql",
            code:
              "DELETE FROM p_typ_prispevku tp\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_poberatel pb\n  WHERE pb.id_typu = tp.id_typu\n);",
          },
        ],
      },
      {
        heading: "Top-N bez FETCH FIRST",
        body: [
          "Skúška vyslovene žiada „kto zaplatil najviac“ BEZ FETCH FIRST — použi vnorenú agregáciu: spočítaj súčet na poistenca, vezmi MAX a ponechaj tých, čo sa mu rovnajú (zachová aj zhody).",
        ],
        code: [
          {
            label: "Osoba, ktorá zaplatila najviac na odvodoch (zachová zhody)",
            lang: "sql",
            code:
              "SELECT id_poistenca, SUM(suma) AS spolu\nFROM p_odvod_platba\nGROUP BY id_poistenca\nHAVING SUM(suma) = (\n  SELECT MAX(s) FROM (\n    SELECT SUM(suma) AS s FROM p_odvod_platba GROUP BY id_poistenca\n  )\n);",
          },
        ],
      },
      {
        heading: "Korelovaný vnorený dopyt",
        body: [
          "Počet nezamestnaných osôb na mesto: korelované NOT EXISTS kontroluje pre každú osobu, či má aktívny záznam v p_zamestnanec.",
        ],
        code: [
          {
            label: "Počet nezamestnaných na mesto (0 ak sú všetci zamestnaní)",
            lang: "sql",
            code:
              "SELECT m.n_mesta,\n  COUNT(CASE WHEN NOT EXISTS (\n    SELECT 1 FROM p_zamestnanec z\n    WHERE z.rod_cislo = o.rod_cislo AND z.dat_do IS NULL\n  ) THEN 1 END) AS pocet_nezamestnanych\nFROM p_mesto m\nLEFT JOIN p_osoba o ON o.PSC = m.PSC\nGROUP BY m.n_mesta;",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- AGGREGATES
  {
    id: "aggregates",
    topic: "aggregates",
    title: "Agregačné funkcie, GROUP BY, HAVING",
    summary:
      "Zlúč veľa riadkov do súhrnných hodnôt, zoskup ich a filtruj skupiny.",
    keyPoints: [
      "Každý neagregovaný stĺpec v SELECT musí byť v GROUP BY.",
      "WHERE filtruje riadky PRED zoskupením; HAVING filtruje skupiny PO ňom.",
      "COUNT(*) ráta riadky; COUNT(stlpec) ignoruje NULL; COUNT(DISTINCT stlpec) ráta rôzne nenulové.",
      "Agregáty preskakujú NULL (AVG delí počtom nenulových).",
    ],
    sections: [
      {
        heading: "GROUP BY musí obsahovať každý obyčajný stĺpec",
        body: [
          "Skúška ukazuje SELECT s id_bicykel, TO_CHAR(zaradenie,'YYYY') a COUNT(*). Platné GROUP BY je `GROUP BY id_bicykel, zaradenie` — zoskupuj podľa každej neagregátnej položky a nikdy nedávaj COUNT(*) do GROUP BY.",
        ],
        code: [
          {
            label: "Príspevky na poberateľa za rok (SQLite strftime)",
            lang: "sql",
            code:
              "SELECT id_poberatela, strftime('%Y', obdobie) AS rok, COUNT(*)\nFROM p_prispevky\nGROUP BY id_poberatela, strftime('%Y', obdobie);",
          },
        ],
      },
      {
        heading: "HAVING pre podmienky na úrovni skupín",
        body: [
          "Osoby s aspoň 3 rôznymi typmi príspevkov — spočítaj rôzne typy na osobu a filtruj cez HAVING.",
        ],
        code: [
          {
            label: "Osoby s ≥ 3 rôznymi typmi príspevkov",
            lang: "sql",
            code:
              "SELECT o.rod_cislo, o.priezvisko, COUNT(DISTINCT pb.id_typu) AS pocet_typov\nFROM p_osoba o\nJOIN p_poberatel pb ON pb.rod_cislo = o.rod_cislo\nGROUP BY o.rod_cislo, o.priezvisko\nHAVING COUNT(DISTINCT pb.id_typu) >= 3;",
          },
        ],
      },
      {
        heading: "MAX / súčty",
        body: [
          "Typy príspevkov a počet ich aktuálnych poberateľov (dat_do IS NULL); LEFT JOIN, aby sa zobrazili aj typy s 0 poberateľmi.",
        ],
        code: [
          {
            label: "Počet aktuálnych poberateľov na typ príspevku",
            lang: "sql",
            code:
              "SELECT tp.id_typu, tp.popis, COUNT(pb.id_poberatela) AS aktualni\nFROM p_typ_prispevku tp\nLEFT JOIN p_poberatel pb\n  ON pb.id_typu = tp.id_typu AND pb.dat_do IS NULL\nGROUP BY tp.id_typu, tp.popis;",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- DDL
  {
    id: "ddl",
    topic: "ddl",
    title: "DDL: CREATE TABLE, ALTER TABLE, ADD stĺpec",
    summary:
      "Definuj a meň štruktúru. DDL implicitne COMMITuje, takže sa nedá odvolať.",
    keyPoints: [
      "ALTER TABLE … ADD pridá stĺpec; ADD CONSTRAINT pridá pravidlo.",
      "Každý DDL príkaz vykoná implicitný COMMIT pred aj po sebe.",
      "Keďže DDL automaticky commituje, riadky vložené pred neskorším ROLLBACK po DDL sú už trvalé.",
      "Zložený primárny kľúč: PRIMARY KEY (stlpec1, stlpec2).",
    ],
    sections: [
      {
        heading: "Pridanie stĺpca s CHECK",
        body: [
          "Pridaj SLOBODNY CHAR(1), ktorý môže obsahovať len 'A' alebo 'N'. V Oracle pripojíš CHECK inline pri ADD alebo ako pomenované obmedzenie.",
        ],
        code: [
          {
            label: "Pridať obmedzený stĺpec",
            lang: "plsql",
            oracleOnly: true,
            code:
              "ALTER TABLE p_osoba\nADD slobodny CHAR(1) CHECK (slobodny IN ('A','N'));",
          },
        ],
      },
      {
        heading: "Zložené / identifikačné kľúče",
        body: [
          "Identifikačný vzťah vtlačí kľúč rodiča do PK potomka (PFK). Tu je PK tab2 (a,b) zároveň FK na tab1(id,id2) → identifikačný, kardinalita 1:N, povinné členstvo.",
        ],
        code: [
          {
            label: "Zložený PK + identifikačný FK",
            lang: "sql",
            code:
              "CREATE TABLE tab1 (\n  id INTEGER, id2 INTEGER,\n  PRIMARY KEY (id, id2)\n);\nCREATE TABLE tab2 (\n  a INTEGER, b INTEGER, c INTEGER,\n  PRIMARY KEY (a, b),\n  FOREIGN KEY (a, b) REFERENCES tab1 (id, id2)\n);",
          },
        ],
      },
      {
        heading: "Chyta: automatický commit pri DDL",
        body: [
          "Postup: insert 10, 20 → ALTER TABLE ADD (cislo) → insert (30,1) → ROLLBACK. ALTER automaticky commitne 10 a 20, takže prežijú; rollbackuje sa len vloženie (30,1). SELECT MAX(pk) → 20.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- DML
  {
    id: "dml",
    topic: "dml",
    title: "DML: INSERT … SELECT, UPDATE, DELETE",
    summary:
      "Meň dáta. INSERT … SELECT musí byť union-kompatibilný so zoznamom cieľových stĺpcov.",
    keyPoints: [
      "INSERT INTO t (stlpce) SELECT … — zoznam SELECT musí sedieť s cieľovými stĺpcami v počte, poradí a type.",
      "UPDATE … SET … WHERE — bez WHERE zmeníš každý riadok.",
      "DELETE odstráni riadky; dodrž referenčnú integritu (najprv potomkov).",
      "SQL%ROWCOUNT (PL/SQL) udáva, koľko riadkov ovplyvnilo posledné DML.",
    ],
    sections: [
      {
        heading: "INSERT … SELECT (union-kompatibilný)",
        body: [
          "Vlož nové osoby z tabuľky nove_osoby. Zoznam SELECT mapuje zdrojové stĺpce na cieľové podľa pozície; vlož len tie, ktoré tam ešte nie sú.",
        ],
        code: [
          {
            label: "Vlož len riadky, ktoré tam ešte nie sú",
            lang: "sql",
            code:
              "INSERT INTO p_osoba (rod_cislo, meno, priezvisko, PSC, ulica)\nSELECT rod_cislo, meno, priezvisko, psc, ulica\nFROM nove_osoby n\nWHERE NOT EXISTS (\n  SELECT 1 FROM p_osoba o WHERE o.rod_cislo = n.rod_cislo\n);",
          },
        ],
      },
      {
        heading: "Cielený UPDATE",
        body: [
          "Ukonči poistenia staršie ako 10 rokov, ktoré nemajú koniec; ukonči poberateľa s percentuálnym vyjadrením < 10.",
        ],
        code: [
          {
            label: "Ukonči aktívne poistenia staršie ako 10 rokov",
            lang: "plsql",
            oracleOnly: true,
            code:
              "UPDATE p_poistenie\nSET dat_do = SYSDATE\nWHERE dat_do IS NULL\n  AND dat_od < ADD_MONTHS(SYSDATE, -120);",
          },
          {
            label: "Ukonči poberateľa s perc_vyj < 10 (SQLite)",
            lang: "sql",
            code:
              "UPDATE p_poberatel\nSET dat_do = date('now')\nWHERE perc_vyj < 10 AND dat_do IS NULL;",
          },
        ],
      },
      {
        heading: "DELETE a referenčné poradie",
        body: [
          "Na vymazanie osoby musíš najskôr odstrániť riadky, ktoré na ňu odkazujú. Poradie zo skúšky pre b_os_udaje: b_oprava, b_porucha, b_pozicanie, b_zakaznik, b_zamestnanec, potom b_os_udaje — potomkov pred rodičmi.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- CONSTRAINTS
  {
    id: "constraints",
    topic: "constraints",
    title: "Obmedzenia: PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT",
    summary:
      "Deklaratívne pravidlá, ktoré DB vynucuje pri každom insert/update. Každé zodpovedá typu integrity.",
    keyPoints: [
      "PRIMARY KEY → entitná integrita (jednoznačný + NOT NULL identifikátor).",
      "FOREIGN KEY → referenčná integrita (musí sedieť s PK/kandidátom alebo byť NULL).",
      "CHECK → používateľská integrita; UNIQUE/DEFAULT → doménová integrita.",
      "FK môže byť NULL len pri nepovinnom členstve (stĺpec nie je súčasťou PK / nie je NOT NULL).",
    ],
    sections: [
      {
        heading: "CHECK obmedzenia",
        body: [
          "Obmedz povolené hodnoty. Príklady zo skúšky: mesiac nie v (11,12,1,2); množstvo 1–255; známka v A–F; nezáporná suma.",
        ],
        code: [
          {
            label: "Rozsah, množina a nezáporné CHECK",
            lang: "plsql",
            oracleOnly: true,
            code:
              "ALTER TABLE p_poberatel\n  ADD CONSTRAINT chk_perc CHECK (perc_vyj BETWEEN 0 AND 100);\n\nALTER TABLE nakup\n  ADD CONSTRAINT chk_mnozstvo CHECK (mnozstvo BETWEEN 1 AND 255);\n\nALTER TABLE hodnotenie\n  ADD CONSTRAINT chk_znamka CHECK (znamka IN ('A','B','C','D','E','F'));\n\nALTER TABLE p_prispevky\n  ADD CONSTRAINT chk_suma CHECK (suma >= 0);",
          },
        ],
      },
      {
        heading: "FK a otázka NULL",
        body: [
          "Referenčná integrita: hodnota FK v R2 sa musí rovnať hodnote PK v R1 ALEBO byť NULL. FK môže byť NULL len pri nepovinnom členstve — t. j. nie je NOT NULL a nie je súčasťou PK (neidentifikačný, nepovinný vzťah).",
        ],
        code: [
          {
            label: "1:1 neidentifikačný, povinný na oboch stranách",
            lang: "sql",
            code:
              "CREATE TABLE zamestnanec (\n  id INTEGER PRIMARY KEY,\n  rod_cislo TEXT\n);\nCREATE TABLE auto (\n  spz TEXT PRIMARY KEY,\n  zamestnanec_id INTEGER NOT NULL,\n  FOREIGN KEY (zamestnanec_id) REFERENCES zamestnanec (id)\n);",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- VIEWS
  {
    id: "views",
    topic: "views",
    title: "Pohľady & WITH CHECK OPTION",
    summary:
      "Pohľad je uložený SELECT. WITH CHECK OPTION zablokuje DML, ktoré by riadok vyradilo z pohľadu.",
    keyPoints: [
      "Pohľad ukladá dopyt, nie dáta; vždy odráža bázové tabuľky.",
      "WITH CHECK OPTION odmietne insert/update, ktorého výsledok by nespĺňal WHERE pohľadu.",
      "Možnosť kaskáduje: vnorený pohľad vynucuje svoj AJ rodičovský predikát.",
      "Použi UNION ALL s literálovým hlavičkovým riadkom na pridanie nadpisov stĺpcov pre export.",
    ],
    sections: [
      {
        heading: "Kaskáda WITH CHECK OPTION",
        body: [
          "v1 vyberá riadky kde meno='Michal'; v2 = SELECT * FROM v1 WHERE priezvisko LIKE 'M%' WITH CHECK OPTION. Update riadku na meno='Marek' zlyhá, lebo nový riadok by už nespĺňal meno='Michal', ktoré v2 vynucuje (ORA-01402). Aj keď option nesie len v1, zmena stále porušuje meno='Michal'.",
        ],
        code: [
          {
            label: "Insert zablokovaný check option",
            lang: "plsql",
            oracleOnly: true,
            code:
              "CREATE VIEW v1 AS\n  SELECT rod_cislo, meno, priezvisko FROM p_osoba WHERE meno='Michal';\nCREATE VIEW v2 AS\n  SELECT * FROM v1 WHERE priezvisko LIKE 'M%' WITH CHECK OPTION;\n\n-- Zlyhá: 'Karol' porušuje meno='Michal'\nINSERT INTO v2 VALUES ('551204/1234','Karol','Matiasko');",
          },
        ],
      },
      {
        heading: "Pohľady s množinovými operáciami",
        body: [
          "INTERSECT nájde duplicitné riadky prítomné v starej aj novej tabuľke. UNION ALL s literálovým riadkom pridá hlavičky pre export.",
        ],
        code: [
          {
            label: "Duplicitné riadky medzi dvoma variantmi",
            lang: "sql",
            code:
              "CREATE VIEW duplicity AS\nSELECT * FROM b_miesto_nove\nINTERSECT\nSELECT * FROM b_miesto_stare;",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- SEQUENCES
  {
    id: "sequences",
    topic: "sequences",
    title: "Sekvencie: NEXTVAL & CURRVAL",
    summary:
      "Serverové generátory čísel pre náhradné kľúče. NEXTVAL posunie, CURRVAL znova prečíta.",
    keyPoints: [
      "CREATE SEQUENCE s START WITH 1 INCREMENT BY 1;",
      "s.NEXTVAL vráti ďalšiu hodnotu a posunie sekvenciu.",
      "s.CURRVAL vráti hodnotu naposledy vytvorenú cez NEXTVAL *v tejto session* (najprv treba NEXTVAL).",
      "Medzery v sekvencii sú normálne (rollback čísla nevracia).",
    ],
    sections: [
      {
        heading: "Získanie aktuálnej vs ďalšej hodnoty",
        body: [
          "Skúšková otázka: ako prečítať aktuálnu a ďalšiu hodnotu sekvencie. NEXTVAL posunie a vráti; CURRVAL len vráti naposledy vydanú hodnotu pre tvoju session — CURRVAL pred prvým NEXTVAL vyvolá ORA-08002.",
        ],
        code: [
          {
            label: "Vytvor a použi sekvenciu",
            lang: "plsql",
            oracleOnly: true,
            code:
              "CREATE SEQUENCE seq_poistenca START WITH 1 INCREMENT BY 1;\n\nINSERT INTO p_poistenie (id_poistenca, rod_cislo, dat_od)\nVALUES (seq_poistenca.NEXTVAL, '801106/3456', SYSDATE);\n\nSELECT seq_poistenca.CURRVAL FROM dual;  -- posledná hodnota tejto session",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- FUNCTIONS/DATES
  {
    id: "functions-dates",
    topic: "functions",
    title: "Vstavané funkcie: dátumy, reťazce, konverzia",
    summary:
      "Oracle dátumové a reťazcové funkcie, čo sa objavujú stále: SYSDATE, EXTRACT, MONTHS_BETWEEN, ADD_MONTHS, TO_CHAR, SUBSTR.",
    keyPoints: [
      "SYSDATE je aktuálny dátum+čas; dátumová aritmetika v dňoch (SYSDATE - 7).",
      "Hodiny/min/sek pridáš zlomkami dňa: SYSDATE + 5/24 + 30/1440 + 10/86400.",
      "MONTHS_BETWEEN(a,b) môže byť záporné ak a < b; ADD_MONTHS(d, n) posunie o mesiace.",
      "EXTRACT(YEAR FROM d), TO_CHAR(d,'YYYY'), TO_CHAR(d,'Q') (kvartál), SUBSTR(s, start, dlzka).",
    ],
    sections: [
      {
        heading: "Dátumová aritmetika",
        body: [
          "Pridanie času k SYSDATE: deň = 1, takže 5 hodín = 5/24, minúty = m/1440, sekundy = s/86400. Odčítaním dvoch DATE dostaneš počet dní.",
        ],
        code: [
          {
            label: "Teraz + 5h 30m 10s",
            lang: "plsql",
            oracleOnly: true,
            code: "SELECT SYSDATE + 5/24 + 30/1440 + 10/86400 AS o_chvilu FROM dual;",
          },
          {
            label: "Poistenia aktívne > 10 rokov (≈ 120 mesiacov)",
            lang: "plsql",
            oracleOnly: true,
            code:
              "SELECT id_poistenca, MONTHS_BETWEEN(SYSDATE, dat_od) AS mesiace\nFROM p_poistenie\nWHERE dat_do IS NULL\n  AND MONTHS_BETWEEN(SYSDATE, dat_od) > 120;",
          },
        ],
      },
      {
        heading: "Kvartály a podreťazce",
        body: [
          "Druhý polrok = kvartály 3 a 4 daného roka. Mesiac narodenia z rodného čísla je na znakoch 3–4.",
        ],
        code: [
          {
            label: "Osoby narodené v prvom polroku",
            lang: "plsql",
            oracleOnly: true,
            code:
              "SELECT * FROM p_osoba\nWHERE TO_NUMBER(SUBSTR(rod_cislo, 3, 2)) <= 6;",
          },
          {
            label: "Počet dní poistenia na osobu (SQLite julianday)",
            lang: "sql",
            code:
              "SELECT o.rod_cislo, o.priezvisko,\n  SUM(CAST(julianday(COALESCE(p.dat_do,'now')) - julianday(p.dat_od) AS INT)) AS dni\nFROM p_osoba o\nJOIN p_poistenie p ON p.rod_cislo = o.rod_cislo\nGROUP BY o.rod_cislo, o.priezvisko;",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- PL/SQL
  {
    id: "plsql",
    topic: "plsql",
    title: "PL/SQL: bloky, procedúry, funkcie, triggre, kurzory",
    summary:
      "Procedurálne rozšírenie Oracle. Ovládaj anonymné bloky, parametrizované procedúry/funkcie, riadkové triggre a kurzorovú slučku.",
    keyPoints: [
      "Anonymný blok: [DECLARE] BEGIN … [EXCEPTION] END; /",
      "Procedúra: CREATE OR REPLACE PROCEDURE p(...) IS BEGIN … END;",
      "Funkcia: musí RETURN hodnotu; použiteľná v SQL/SELECT.",
      "Riadkový trigger: BEFORE/AFTER INSERT/UPDATE/DELETE … FOR EACH ROW, s :NEW / :OLD.",
      "Poradie kurzora: OPEN → LOOP (FETCH → EXIT WHEN %NOTFOUND → spracuj) → CLOSE.",
    ],
    sections: [
      {
        heading: "Procedúry & funkcie",
        body: [
          "Procedúra vykoná akciu; funkcia vráti hodnotu. Skúška žiada funkciu vracajúcu počet rokov poistenia osoby a procedúry na hromadnú zmenu (napr. ukonči všetky poistenia osoby podľa rod. čísla).",
        ],
        code: [
          {
            label: "Funkcia: počet rokov poistenia osoby",
            lang: "plsql",
            oracleOnly: true,
            code:
              "CREATE OR REPLACE FUNCTION roky_poistenia (p_rc IN p_poistenie.rod_cislo%TYPE)\n  RETURN NUMBER\nAS\n  roky NUMBER;\nBEGIN\n  SELECT SUM(MONTHS_BETWEEN(NVL(dat_do, SYSDATE), dat_od)) / 12\n    INTO roky\n  FROM p_poistenie\n  WHERE rod_cislo = p_rc;\n  RETURN roky;\nEND;\n/",
          },
          {
            label: "Volanie procedúry s OUT parametrom v bloku",
            lang: "plsql",
            oracleOnly: true,
            code:
              "DECLARE\n  v_vysledok INTEGER;\nBEGIN\n  p_test(4, v_vysledok);   -- vnútri bloku bez kľúčového slova EXEC\nEND;\n/",
          },
        ],
      },
      {
        heading: "Triggre (BEFORE … FOR EACH ROW)",
        body: [
          "Triggre vynucujú pravidlá naprieč riadkami, ktoré constraint nezvládne. Klasické zadania: osoba nemôže mať viac ako jedno aktívne poistenie; poberateľ max 3 príspevky v mesiaci; študent max 5 predmetov; banková transakcia nesmie dať zostatok do mínusu.",
        ],
        code: [
          {
            label: "Zákaz druhého aktívneho poistenia",
            lang: "plsql",
            oracleOnly: true,
            code:
              "CREATE OR REPLACE TRIGGER kontrola_aktivneho\nBEFORE INSERT OR UPDATE ON p_poistenie\nFOR EACH ROW\nDECLARE\n  v_count NUMBER;\nBEGIN\n  SELECT COUNT(*) INTO v_count\n  FROM p_poistenie\n  WHERE rod_cislo = :NEW.rod_cislo AND dat_do IS NULL;\n  IF v_count > 0 THEN\n    RAISE_APPLICATION_ERROR(-20001, 'Osoba ma uz aktivne poistenie.');\n  END IF;\nEND;\n/",
          },
          {
            label: "Zostatok účtu nesmie byť záporný",
            lang: "plsql",
            oracleOnly: true,
            code:
              "CREATE OR REPLACE TRIGGER nezaporny_zostatok\nBEFORE INSERT ON transakcia\nFOR EACH ROW\nDECLARE\n  v_sum NUMBER;\nBEGIN\n  SELECT NVL(SUM(suma),0) INTO v_sum\n  FROM transakcia WHERE id_uctu = :NEW.id_uctu;\n  IF v_sum + :NEW.suma < 0 THEN\n    RAISE_APPLICATION_ERROR(-20002, 'Zostatok by bol zaporny.');\n  END IF;\nEND;\n/",
          },
        ],
      },
      {
        heading: "Kurzory",
        body: [
          "Kurzor je objekt, ktorý sprístupňuje riadky SELECT-u po jednom. Na prejdenie každého riadku práve raz je poradie OPEN(2) → FETCH(3) → EXIT WHEN %NOTFOUND(4) → … → CLOSE(1), teda 2,3,4,1. Aby kurzor nad spojením vrátil len rôzne názvy miest, pridaj GROUP BY nazov (alebo DISTINCT).",
        ],
        code: [
          {
            label: "Kostra kurzorovej slučky",
            lang: "plsql",
            oracleOnly: true,
            code:
              "DECLARE\n  CURSOR c IS SELECT n_mesta FROM p_mesto JOIN p_osoba USING (PSC) GROUP BY n_mesta;\n  v c%ROWTYPE;\nBEGIN\n  OPEN c;\n  LOOP\n    FETCH c INTO v;\n    EXIT WHEN c%NOTFOUND;\n    DBMS_OUTPUT.PUT_LINE(v.n_mesta);\n  END LOOP;\n  CLOSE c;\nEND;\n/",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- TRANSACTIONS
  {
    id: "transactions",
    topic: "transactions",
    title: "Transakcie, ACID, COMMIT / ROLLBACK / SAVEPOINT",
    summary:
      "Transakcia je nedeliteľná jednotka práce (všetko-alebo-nič). Ovládaj ACID a ako sa COMMIT, ROLLBACK, SAVEPOINT a automatický commit DDL ovplyvňujú.",
    keyPoints: [
      "ACID = Atomickosť, Konzistencia, Izolácia, Trvácnosť (Durability).",
      "COMMIT natrvalo uloží zmeny; ROLLBACK zruší všetko od posledného COMMIT.",
      "ROLLBACK TO SAVEPOINT s zruší len prácu po s.",
      "DDL (CREATE/ALTER) vykoná implicitný COMMIT — nedá sa odvolať.",
    ],
    sections: [
      {
        heading: "ACID",
        body: [
          "Atomickosť: celá transakcia prebehne, alebo vôbec. Konzistencia: prevedie DB z platného stavu do platného (všetky obmedzenia platia). Izolácia: súbežné transakcie sa neovplyvnia; výsledok zodpovedá nejakému sériovému poradiu. Trvácnosť: po commite zmeny prežijú výpadok.",
        ],
      },
      {
        heading: "COMMIT / ROLLBACK prechody",
        body: [
          "insert 1,2,3,4 → ROLLBACK → insert 5,6,4 → COMMIT: COUNT(*) = 3 (1–4 zrušené; 5,6,4 ostávajú).",
          "insert 1,2,3 → COMMIT → insert 5 → ROLLBACK → insert 6,4 → COMMIT: MAX(id) = 6 (5 zrušená).",
          "insert 50,40 → COMMIT → insert 30 → ROLLBACK: COUNT(*) = 2, MAX(pk) = 50.",
        ],
      },
      {
        heading: "SAVEPOINT",
        body: [
          "SAVEPOINT je pomenovaná značka v transakcii. ROLLBACK TO savepoint zahodí prácu po značke a ponechá skoršiu; neskorší úplný COMMIT uloží to, čo ostalo.",
        ],
        code: [
          {
            label: "Príklad SAVEPOINT",
            lang: "plsql",
            oracleOnly: true,
            code:
              "INSERT INTO tab1 VALUES (10);\nINSERT INTO tab1 VALUES (20);\nSAVEPOINT s1;\nDELETE FROM tab1 WHERE pk = 10;\nROLLBACK TO s1;   -- delete je zrušený, 10 je späť\nINSERT INTO tab1 VALUES (30);\nCOMMIT;           -- 10, 20, 30 ostávajú",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- NORMALIZATION
  {
    id: "normalization",
    topic: "normalization",
    title: "Funkčné závislosti & normálové formy (1NF–BCNF)",
    summary:
      "Nájdi závislosti a kandidátov PK, potom dekomponuj na odstránenie redundancie a anomálií. Istý skúškový blok.",
    keyPoints: [
      "FZ X→Y: každá hodnota X určuje práve jednu hodnotu Y. X je determinant.",
      "Kandidátsky kľúč = minimálna množina, ktorá funkčne určuje všetky atribúty.",
      "1NF: atomické atribúty. 2NF: 1NF + žiadna parciálna závislosť na časti zloženého kľúča.",
      "3NF: 2NF + žiadna tranzitívna závislosť na kľúči. BCNF: každý determinant je kandidát PK.",
    ],
    sections: [
      {
        heading: "Determinanty & typy závislostí",
        body: [
          "Pre (A,B)→C, C→D: determinanty sú (A,B) a C; (A,B)→D je tranzitívna. Pre D→C, (A,B)→D, C→D sú determinanty D, (A,B), C (a D↔C sú vzájomne závislé).",
          "Typy: triviálna (RHS ⊆ LHS, napr. (A,B)→A), úplná (závisí od celého LHS), parciálna (závisí od časti zloženého kľúča), tranzitívna (A→B, B→C ⇒ A→C), vzájomná (A→B aj B→A).",
        ],
      },
      {
        heading: "Je to v BCNF? (hlavný dril)",
        body: [
          "Postup: (1) vypíš FZ; (2) nájdi kandidátov PK; (3) relácia je v BCNF iff každý determinant je kandidát PK; (4) ak nejaký determinant nie je kandidát PK, dekomponuj rozdelením tej FZ do vlastnej relácie, pričom determinant ponecháš v pôvodnej pre bezstratové spojenie.",
          "3NF vs BCNF: BCNF je striktnejšia. Relácia môže byť v 3NF a nie v BCNF pri prekrývajúcich sa zložených kandidátoch PK (napr. VYUKA(Student,Predmet,Ucitel) s Ucitel→Predmet). Bezpečná dekompozícia: (Ucitel,Predmet) + (Student,Ucitel) — rekonštruuje sa bezstratovo.",
        ],
        code: [
          {
            label: "Riešený príklad",
            lang: "text",
            code:
              "R(OC, RC, Meno, Priezvisko, PSC, Obec, CP, Nazov, Vysl)\nFZ:  CP -> Nazov ;  (OC,CP) -> Vysl ;  OC -> RC,Meno,Priezvisko,PSC ;\n     RC -> OC ;  PSC -> Obec\nKandidáti PK: (OC,CP) a (RC,CP)\nNie je v BCNF (CP, OC, PSC sú determinanty, ale nie kandidáti PK).\nBCNF dekompozícia:\n  PREDMET(CP, Nazov)\n  VYUCBA(OC, CP, Vysl)\n  OBEC(PSC, Obec)\n  OSOBA(OC, RC, Meno, Priezvisko, PSC)",
          },
        ],
      },
      {
        heading: "Anomálie, ktoré normalizácia odstraňuje",
        body: [
          "Redundancia (opakované fakty), update anomália (zmeníš jednu kópiu, ostatné zostarnú), delete anomália (zmazaním riadku stratíš nesúvisiace fakty), insert anomália (nedá sa pridať fakt bez nesúvisiaceho, napr. študent bez predmetu).",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- ER MODELING
  {
    id: "er-modeling",
    topic: "er-modeling",
    title: "ERA modelovanie: kardinalita, členstvo, identifikačný vs nie",
    summary:
      "Preveď slovný popis (alebo SQL) na entity, vzťahy, kardinalitu a členstvo.",
    keyPoints: [
      "Kardinalita: 1:1, 1:N, M:N (M:N potrebuje väzobnú/vzťahovú tabuľku).",
      "Členstvo: povinné (musí participovať) vs nepovinné (môže). V SQL NOT NULL FK ⇒ povinné.",
      "Identifikačný vzťah: FK je súčasťou PK potomka (PFK), plná čiara.",
      "Neidentifikačný: FK je mimo PK (prerušovaná čiara).",
    ],
    sections: [
      {
        heading: "Čítanie kardinality & členstva",
        body: [
          "„Študent musí mať aspoň jedno pero; pero patrí práve jednému študentovi“ → povinné členstvo, 1:N. „KLIENT(id_klienta), OBJEDNAVKA(id_objednavky, id_klienta FK)“ → neidentifikačný 1:N (jeden klient, viac objednávok).",
          "„Zamestnanec môže mať najviac jedno auto; každé auto musí patriť práve jednému zamestnancovi“ → zamestnanec nepovinné, auto povinné, kardinalita 0..1 : 1.",
        ],
      },
      {
        heading: "Identifikačný vs neidentifikačný z SQL",
        body: [
          "t1(id PK); t2(id, hodnota, PRIMARY KEY(id,hodnota)) kde id odkazuje na t1 → identifikačný, 1:N (FK id je vnútri PK t2). Ak má t2 vlastný PK a samostatný FK stĺpec → neidentifikačný.",
        ],
        code: [
          {
            label: "Lineárny ERA zápis (AUTO–VODIC)",
            lang: "text",
            code:
              "AUTO( id_auto [PK], znacka, model, rok_vyroby, stav )\nVODIC( id_vodic [PK], meno, priezvisko, datum_narodenia, cislo_vp )\nPOZICANIE( id_pozicanie [PK], id_auto [FK], id_vodic [FK],\n           datum_od, datum_do, cena )\n-- M:N: jedno auto môže byť požičané viacerým vodičom; vodič viac áut.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- INTEGRITY
  {
    id: "integrity",
    topic: "integrity",
    title: "Typy integrity & kľúče",
    summary:
      "Štyri druhy integrity a kľúčová slovná zásoba (primárny, kandidátsky, super kľúč, determinant).",
    keyPoints: [
      "Entitná integrita: PK je jednoznačný a NOT NULL (identifikuje každý riadok).",
      "Referenčná integrita: každý FK sedí s existujúcou hodnotou PK alebo je NULL.",
      "Doménová integrita: hodnoty pochádzajú z domény/typu stĺpca (UNIQUE, DEFAULT, typ, povolená množina).",
      "Používateľská integrita: biznis pravidlá cez CHECK/triggre (napr. vek ≥ 18).",
    ],
    sections: [
      {
        heading: "Ktorá integrita to je?",
        body: [
          "CHECK(datum_narodenia <= SYSDATE) alebo CHECK(vek >= 18) → používateľská (biznis pravidlo). Doména DOM_DNI povoľujúca len PO…NE → doménová. NOT NULL na stĺpci → entitná/doménová. Či „rodné číslo obsahuje /“ je používateľská, je sporné — je to skôr formátové (doménové) pravidlo.",
        ],
      },
      {
        heading: "Slovná zásoba kľúčov",
        body: [
          "Superkľúč: ľubovoľná množina atribútov, ktorá jednoznačne identifikuje riadok (môže mať navyše). Kandidátsky kľúč: minimálny superkľúč (jednoznačný + minimálny). Primárny kľúč: jeden zvolený kandidát, vždy NOT NULL. Determinant: množina, na ktorej je iný atribút funkčne závislý — každý kandidát PK je determinant, no nie každý determinant je kandidát PK.",
        ],
      },
      {
        heading: "Slovná zásoba relácie",
        body: [
          "Stupeň = počet atribútov (stĺpcov); kardinalita relácie = počet n-tíc (riadkov). Vlastnosti relácie (ANNU): Atomické hodnoty, Neusporiadanosť riadkov, Neusporiadanosť stĺpcov, Unikátnosť riadkov. Prázdna tabuľka má stále svoj stupeň; jej kardinalita je 0.",
        ],
      },
    ],
  },

  // ---------------------------------------------------------------- RELATIONAL ALGEBRA
  {
    id: "relational-algebra",
    topic: "relational-algebra",
    title: "Relačná algebra",
    summary:
      "Formálne operátory za SQL: unárne (výber, projekcia) a binárne (množinové operácie, spojenia, delenie).",
    keyPoints: [
      "Unárne: σ výber (riadky), π projekcia (stĺpce).",
      "Binárne množinové: ∪ zjednotenie, ∩ prienik, − rozdiel, × kartézsky súčin (∪/∩/− potrebujú union-kompatibilitu).",
      "Relačné operácie: ⋈ spojenie, ÷ delenie.",
      "Union-kompatibilné = rovnaký počet atribútov s rovnakými doménami, v rovnakom poradí.",
    ],
    sections: [
      {
        heading: "Výber vs projekcia",
        body: [
          "σ (výber) zachová riadky spĺňajúce podmienku — ako SQL WHERE. π (projekcia) zachová vybrané stĺpce — ako SQL SELECT zoznam. Spojenie možno vyjadriť ako σ_podmienka(R1 × R2).",
        ],
        code: [
          {
            label: "Algebra ↔ SQL",
            lang: "text",
            code:
              "σ_oslobodeny='A'(p_poistenie)  ≡  SELECT * FROM p_poistenie WHERE oslobodeny='A';\nπ_meno,priezvisko(p_osoba)     ≡  SELECT meno, priezvisko FROM p_osoba;",
          },
        ],
      },
      {
        heading: "Union-kompatibilita",
        body: [
          "Pre UNION/INTERSECT/DIFFERENCE musia mať obe strany rovnaký počet stĺpcov s rovnakými typmi v rovnakom poradí. SELECT id_porucha,id_bicykel,id_zakaznik,nahlasenie je union-kompatibilný s SELECT id_porucha,id_bicykel,241,TO_DATE('20.05.2020','DD.MM.RRRR') — rovnaká arita a domény.",
        ],
        code: [
          {
            label: "Spoj poistencov a poberateľov",
            lang: "sql",
            code:
              "SELECT rod_cislo FROM p_poistenie\nUNION\nSELECT rod_cislo FROM p_poberatel;",
          },
        ],
      },
      {
        heading: "Delenie & anti-join",
        body: [
          "Delenie odpovedá na „nájdi X súvisiace so VŠETKÝMI Y“ (napr. študentov zapísaných na každý povinný predmet). ANTI JOIN (R − semijoin) odpovedá na „X súvisiace so ŽIADNYM Y“, čo SQL píše cez NOT EXISTS / NOT IN.",
        ],
      },
    ],
  },
];

export const LESSON_MAP: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);
