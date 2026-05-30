import type { Flashcard } from "@/types";

export const FLASHCARDS: Flashcard[] = [
  // transakcie
  { id: "f-acid", topic: "transactions", front: "ACID", back: "Atomicita, Konzistencia, Izolácia, Trvácnosť (Durability) — vlastnosti transakcie." },
  { id: "f-commit", topic: "transactions", front: "COMMIT vs ROLLBACK", back: "COMMIT natrvalo uloží zmeny od posledného commitu; ROLLBACK ich zruší." },
  { id: "f-savepoint", topic: "transactions", front: "SAVEPOINT", back: "Pomenovaný bod; ROLLBACK TO savepoint zruší len prácu po tomto bode." },
  { id: "f-ddl-commit", topic: "transactions", front: "Commituje DDL?", back: "Áno — CREATE/ALTER/DROP vykonajú implicitný COMMIT a nedajú sa odvolať." },

  // normalizácia
  { id: "f-fd", topic: "normalization", front: "Funkčná závislosť X→Y", back: "Každá hodnota X určuje práve jednu hodnotu Y. X je determinant." },
  { id: "f-determinant", topic: "normalization", front: "Determinant", back: "Množina atribútov, na ktorej je iný atribút funkčne závislý." },
  { id: "f-1nf", topic: "normalization", front: "1NF", back: "Všetky atribúty sú atomické (žiadne opakujúce sa / viachodnotové polia)." },
  { id: "f-2nf", topic: "normalization", front: "2NF", back: "1NF a každý nekľúčový atribút úplne závisí od celého kľúča (žiadna parciálna závislosť)." },
  { id: "f-3nf", topic: "normalization", front: "3NF", back: "2NF a žiadny nekľúčový atribút nie je tranzitívne závislý od kľúča." },
  { id: "f-bcnf", topic: "normalization", front: "BCNF", back: "Každý determinant je kandidátom na primárny kľúč. Silnejšia ako 3NF." },
  { id: "f-transitive", topic: "normalization", front: "Tranzitívna závislosť", back: "Ak A→B a B→C, potom A→C (príčina porušenia 3NF)." },
  { id: "f-anomalies", topic: "normalization", front: "Anomálie normalizácie", back: "Redundancia, update anomália, delete anomália, insert anomália." },
  { id: "f-2nf-violation", topic: "normalization", front: "Príklad porušenia 2NF", back: "(rod_cislo, id_predmetu)→meno, pričom rod_cislo→meno = parciálna závislosť." },

  // kľúče / integrita
  { id: "f-superkey", topic: "integrity", front: "Superkľúč", back: "Ľubovoľná množina atribútov, ktorá jednoznačne identifikuje riadok (môže mať navyše)." },
  { id: "f-candidate", topic: "integrity", front: "Kandidátsky kľúč", back: "Minimálny superkľúč — jednoznačný a minimálny. Relácia ich môže mať viacero." },
  { id: "f-pk", topic: "integrity", front: "Primárny kľúč (PK)", back: "Jeden zvolený kandidátsky kľúč; vždy jednoznačný a NOT NULL." },
  { id: "f-fk", topic: "integrity", front: "Cudzí kľúč (FK)", back: "Množina atribútov v R2, ktorá je v inej relácii R1 PK alebo kandidátom PK." },
  { id: "f-entity-int", topic: "integrity", front: "Entitná integrita", back: "Primárny kľúč je jednoznačný a nie NULL (každý riadok je identifikovateľný)." },
  { id: "f-ref-int", topic: "integrity", front: "Referenčná integrita", back: "Hodnota každého FK sa rovná existujúcej hodnote PK, alebo je NULL." },
  { id: "f-domain-int", topic: "integrity", front: "Doménová integrita", back: "Hodnoty pochádzajú z domény stĺpca (typ, UNIQUE, DEFAULT, povolená množina)." },
  { id: "f-user-int", topic: "integrity", front: "Používateľská integrita", back: "Biznis pravidlá cez CHECK / triggre, napr. vek ≥ 18." },
  { id: "f-degree", topic: "integrity", front: "Stupeň vs kardinalita relácie", back: "Stupeň = počet atribútov (stĺpcov); kardinalita = počet n-tíc (riadkov)." },
  { id: "f-degree-zero", topic: "integrity", front: "Kedy je stupeň relácie 0?", back: "Keď relácia nemá žiadne atribúty (stĺpce)." },
  { id: "f-annu", topic: "integrity", front: "ANNU (vlastnosti relácie)", back: "Atomické hodnoty, Neusporiadanosť riadkov, Neusporiadanosť stĺpcov, Unikátnosť riadkov." },

  // ERA modelovanie
  { id: "f-cardinality", topic: "er-modeling", front: "Typy kardinality", back: "1:1, 1:N, M:N (M:N potrebuje väzobnú/vzťahovú tabuľku)." },
  { id: "f-membership", topic: "er-modeling", front: "Členstvo (povinnosť)", back: "Povinné (musí sa zúčastniť) vs nepovinné (môže). NOT NULL FK ⇒ povinné." },
  { id: "f-identifying", topic: "er-modeling", front: "Identifikačný vzťah", back: "FK je súčasťou PK potomka (PFK); plná čiara v diagrame." },
  { id: "f-nonidentifying", topic: "er-modeling", front: "Neidentifikačný vzťah", back: "FK je mimo PK potomka; prerušovaná čiara." },
  { id: "f-isa", topic: "er-modeling", front: "ISA hierarchia", back: "Špecializácia: podtypy dedia atribúty a identifikátor nadtypu." },
  { id: "f-composite-pk-when", topic: "er-modeling", front: "Kedy zložený PK?", back: "Vo vzťahových entitách (M:N), kde sa schádzajú PFK z viacerých entít." },

  // spojenia
  { id: "f-inner", topic: "joins", front: "INNER JOIN", back: "Zachová len riadky, ktoré majú zhodu v oboch tabuľkách." },
  { id: "f-left", topic: "joins", front: "LEFT OUTER JOIN", back: "Zachová všetky ľavé riadky; nezhodné pravé stĺpce budú NULL." },
  { id: "f-using-on", topic: "joins", front: "USING vs ON", back: "USING(stlpec) spojí rovnomenné stĺpce a zobrazí raz; ON dovoľuje ľubovoľnú podmienku." },
  { id: "f-anti", topic: "joins", front: "ANTI JOIN", back: "Ľavé riadky BEZ zhody — cez NOT EXISTS / NOT IN." },
  { id: "f-semi", topic: "joins", front: "SEMI JOIN", back: "Ľavé riadky s aspoň jednou zhodou — cez EXISTS / IN." },
  { id: "f-natural", topic: "joins", front: "NATURAL JOIN", back: "Automaticky spojí cez všetky rovnomenné stĺpce a zobrazí ich raz." },

  // vnorené dopyty
  { id: "f-notexists", topic: "subqueries", front: "NOT IN vs NOT EXISTS", back: "NOT IN zlyhá, ak vnorený dopyt vráti NULL; NOT EXISTS je bezpečné." },
  { id: "f-topn-nofetch", topic: "subqueries", front: "Top-N bez FETCH FIRST", back: "HAVING COUNT(*) = (SELECT MAX(cnt) FROM (… GROUP BY …)) — zachová aj zhody." },

  // agregácie
  { id: "f-where-having", topic: "aggregates", front: "WHERE vs HAVING", back: "WHERE filtruje riadky pred zoskupením; HAVING filtruje skupiny po ňom." },
  { id: "f-countstar", topic: "aggregates", front: "COUNT(*) vs COUNT(stlpec)", back: "COUNT(*) ráta riadky; COUNT(stlpec) ignoruje NULL; COUNT(DISTINCT) ráta rôzne nenulové." },
  { id: "f-groupby-rule", topic: "aggregates", front: "Pravidlo GROUP BY", back: "Každý neagregovaný stĺpec v SELECT musí byť v GROUP BY." },

  // ddl/dml
  { id: "f-insert-select", topic: "dml", front: "INSERT … SELECT", back: "SELECT musí byť union-kompatibilný s cieľovými stĺpcami (počet, poradie, typ)." },
  { id: "f-rowcount", topic: "dml", front: "SQL%ROWCOUNT", back: "V PL/SQL počet riadkov ovplyvnených posledným DML príkazom." },
  { id: "f-delete-order", topic: "dml", front: "Poradie mazania", back: "Najprv potomkov (odkazujúce riadky), potom rodičov — kvôli referenčnej integrite." },

  // obmedzenia
  { id: "f-check", topic: "constraints", front: "CHECK constraint", back: "Obmedzí povolené hodnoty, napr. CHECK (slobodny IN ('A','N')). Používateľská integrita." },
  { id: "f-fk-null", topic: "constraints", front: "Kedy môže byť FK NULL?", back: "Len pri nepovinnom členstve — FK nie je NOT NULL ani súčasťou PK." },
  { id: "f-composite-pk", topic: "constraints", front: "Zložený PK", back: "PRIMARY KEY (stlpec1, stlpec2) — typické vo väzobných tabuľkách M:N." },

  // pohľady
  { id: "f-check-option", topic: "views", front: "WITH CHECK OPTION", back: "Odmietne DML, ktorého výsledok by nespĺňal WHERE pohľadu; kaskáduje na nadradené pohľady." },
  { id: "f-view", topic: "views", front: "Čo je pohľad?", back: "Uložený SELECT (virtuálna tabuľka); odráža dáta báz. tabuliek, sám neukladá riadky." },

  // sekvencie
  { id: "f-nextval", topic: "sequences", front: "NEXTVAL vs CURRVAL", back: "NEXTVAL posunie a vráti ďalšie číslo; CURRVAL vráti posledné v rámci relácie (session)." },

  // funkcie
  { id: "f-sysdate", topic: "functions", front: "Jednotky dátumovej aritmetiky", back: "SYSDATE+1 = +1 deň; +5/24 = 5 hodín; +n/1440 = minúty; +n/86400 = sekundy." },
  { id: "f-months-between", topic: "functions", front: "MONTHS_BETWEEN(a,b)", back: "Mesiace medzi dátumami; záporné ak a<b. ADD_MONTHS(d,n) posunie o mesiace." },
  { id: "f-null-compare", topic: "functions", front: "Porovnanie s NULL", back: "= NULL nikdy nesedí; používaj IS NULL / IS NOT NULL." },

  // relačná algebra
  { id: "f-select-project", topic: "relational-algebra", front: "σ vs π", back: "σ (výber) filtruje riadky (WHERE); π (projekcia) vyberá stĺpce (SELECT)." },
  { id: "f-union-compat", topic: "relational-algebra", front: "Union-kompatibilita", back: "Rovnaký počet stĺpcov s rovnakými doménami v rovnakom poradí; treba pre ∪, ∩, −." },
  { id: "f-division", topic: "relational-algebra", front: "Delenie (÷)", back: "Nájde X súvisiace so VŠETKÝMI Y, napr. študentov zapísaných na každý predmet." },
  { id: "f-unary-binary", topic: "relational-algebra", front: "Unárne vs binárne operácie", back: "Unárne: výber, projekcia. Binárne: kart. súčin, zjednotenie, prienik, rozdiel, spojenie, delenie." },

  // plsql
  { id: "f-cursor", topic: "plsql", front: "Poradie príkazov kurzora", back: "OPEN → LOOP(FETCH → EXIT WHEN %NOTFOUND → spracuj) → CLOSE." },
  { id: "f-proc-func", topic: "plsql", front: "Procedúra vs funkcia", back: "Procedúra vykoná akciu; funkcia musí RETURN hodnotu a dá sa použiť v SQL." },
  { id: "f-trigger", topic: "plsql", front: "Riadkový trigger", back: "BEFORE/AFTER INSERT/UPDATE/DELETE … FOR EACH ROW, používa :NEW a :OLD." },
  { id: "f-cursor-def", topic: "plsql", front: "Čo je kurzor?", back: "Objekt sprístupňujúci riadky výsledku SELECT-u po jednom." },
];

export const FLASHCARD_MAP: Record<string, Flashcard> = Object.fromEntries(
  FLASHCARDS.map((f) => [f.id, f]),
);
