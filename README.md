# U OKVIRU PUBLISHED EVENT-A, KADA TO, MI TREBAMO DA INCREMENTIRAMO I POSALJEMO ODNOSNO PUBLISH-UJEMO `version`, KOJI, USTVARI PUBLISH-UJEMO SA OSTAKOM DATA-E

PRVO CU TI RECI JESTE DA POGLEDAS VIDEO `19-17`

***

digresija: **POSLDNJI NASLOV JE JAKO VAXZN ZA OVAJ BRANCH**

***

OVO SU NEKA MOJA ZAPAZANJA

***
***

ZAMISLI DA IMAS NEKOLIKO MICROSERVICE-OVA, KAO STO BI BIO  `comments`, `moderation` I `query`

1. TREBAS DA RAZMISLJAS O TOME **KOJI SU PRIMARNI DATASET-OVI, ODNONO RECORS, ODNOSNO PRIMARNA KOLEKCIJA U DATNBASE-U, ZA ODREDJENI MICROSERVICE**

- PA `comments`-U BI PRIMARNI RECORDS BUILI `Comment` DOKUMENTI, KOJI SU STORED U KOLEKCIJI, DATBASE-A TIED TO comments MICROSERVICE

- `moderation` BI IMAO REPLICATED Comments U SVOM DATABSE-U, I PORED TOGA NISTA DRUGO, JER SE BAVI MODERATIONOM SAMIH KOMENTARA

- `query` BI ISTO TAKO IMAO REPLICATED Comments U SVOM DATBASE-U, ALI ISTO TAKO MOZDA REPLICATED NEKE DRUGE KOLEKCIJE, KOJI NISU NJEGOVE PRIMARNE ,STO NIJE NI BITNO U TRENUTNOM ZAMISLJENOM PRIMERU

2. TREBAS DA RAZMISLJAS O **"PRIMARNOJ ODGOVORNOSTI" ZA DATA, ODNOSNO DA MICROSERVICE MORA DA DOBIJE INFORMACIJU, AKO SE NJEGOV PRIMARNI DATA, KOJI JE REPLICATED U NEKOM DRUUGOM SERVICE-U, IUSTVARI PROMENI**

OVO KONKRETNO BI BILO VAZNO U TVOM ZAMISLJENOM PRIMERU, DA NIKAKO `moderation` SERVICE NE OPSLUZI `query` SERVICE SA MODERATED Comment-OM, JER ON NIJE ODGOVORAN DA MANIPULISE REPLICIANIM PODACIMA, A DA ZA TO NE ZNA `comments` MICROSERVICE, CIJI SU Comments, USTVARI PRIMARNI PODACI

***
***

I OVO JE NAJVAZNIJE

3. TREBAS DA RAZMISLJAS O TOME **DA KADA PUBLISH-UJES EVENT, U KOJI SI STAVIO INCREMENTED `version`, DAKLE KOJI SI INCREMENTIRAO PRE PUBLISHINGA; DA SAMO TO SME DA RADI MICROSERVICE, AKO JE U PITANJU NJEGOV PRIMARNI DATA, KOJEM SE DESIO `CREATE/UPDATE/DESTROY`**

***
***

# OVE TVRDJE GORE BI TREBALO DA DOKAZEM ZAMISLJENIM SCENARIJOM, PO KOJEM CU ZAMISLITI SLANJEE EVENT-OVA

**PRVO CU TI RECI KAKO STVARI MOGU KRENUTI PO ZLU, AKO NE PAZIS NA GORNJU 3 STAVKU, KOJU SAM TI LAY-OVAO DOWN**

SCENARIO CE KRENUTI OD TOGA DA JE USER HIT-OVAO `comments` MICROSERVICE, JER JE NAPRAVIO NOVI KOMENTAR

1. `comments` MICROSERVICE STORE-UJE DOKUMENT U DATBASE, I STOREUJE GA, SA `version`: `0`

2. `comments` MICROSERVICE ISSUE-UJE EVENT ZA `"comment:created"`, U KOJEM JE SA, OSTALOM DATA-OM, POSLAT I `version`: `0`

3. I `query` I `moderation` ANTICIPATE-UJU EVENT-OVE IZ KANALA `"comment:created"`, ONI DOBIJAJU DATA

`moderation` STORE-UJE DATA SA `version: 0`, I AWAIT-UJE DA NEKI AUTOMATED PROCESS, ILI REAL PERSON ADMINISTARTOR AUDIT-UJE OVAJ DATA

`query` ISTO STORE-UJE DATA SA `version: 0`, I KORISNIK MOZE DA UZIMA TAJ DATA ODMAH, DO DUSE NIJE AUDITED, ALI JE MOZDA BLURED ILI NESTO SLICNO, UGLAVNOM JE DA KORISNIK DOBIJA TA JDATA ODMAH

4. **OVAJ KORAK JE TAJ U KOJEM CU URADITI POGRESNU STVAR**

NAIME `moderation` JE AUDIT-OVAO USPESNO COMMENT I ODLUCIO DA POSALJE EVENT `"comment:moderated"`

**ALI JE PRI PLISHINGU EVENTA, INCREMNTIRAO VERZIJU, I SADA ONA IZNOSI `version`: `1`**

5. EVENT `"comment:moderated"` EVENTUALLY STIZE DO `comments` MICROSERVICE-A,, JER RKAO SAM TII RANIJE DAJE ON ODGOVORAN MICROSERVICE ZA COMMENTS, JER TO MU JE PRIMARY RECORD

`comments` STORE-UJE DATA, KOJE IMA `version`: `1`

MEDJUTIM MORA DA KAZE `query` MICROSERVICE-U DA JE DATA AUDITED, KAKO BI GA OVAJ OBEZBEDIO KORISNIKU

6. `comments` ISSUE-UJE NOVI EVENT, KOJI SE ZOVE `"comment:updated"`, I NARAVNO POVECAO JE `version` I ON SADA IZNOSI `2`

7. **ERROR CE SE DESITI NA `query` STRANI, KADA POKUSA DA PROCESS-UJE, POMENUTI EVENT KOJI JE STIGAO IZ `"comment:updated"` KANALA**

ZASTO?

PA AKO SE SECAS U SVOM DATBASE-U, `query` IMA DOKUMANT KOJI IMA `version`: `0`, A INCOMMING EVENT MU JE DONEO `version`: `2`

**I ZBOG TOGA SE THROW-OVAO ERROR, I NIJE USPEO UPDATING**

STO ZNACI I DA USER NECE DOBITI FRESH DATA

# RESENJE NA GORNJI PROBLEM, JE DA SE `version` NE INCREMENTIRA, PRI PUBLISHING-U EVENTA, AKO JE MICROSERVICE PROMENIO DATA, ZA KOJI ON NIJE PRIMARNO ODGOVORAN

NAIME `comments`-U JE PRIMARNI DATA Comments

I SAMO JE ON IMAO PRAVO DA PRI PUBLISHINGU EVENTA, KADA JE NJGOV AT "CREATED/UPDATED/DESTROYED", USTVARI INCREMNTIRA `version`

MOJ ZAMISLJENI PROBLEM KOJI SAM TI GORE PREDSTAVIO, BIO BI RESEN KADA `moderation` MICROSERVICE NE BI INCREMENT-OVAO `version`, KADA JE PUBLISH-OVAO TO `"comment:mderated"` CHANNEL

# TI MOZDA SADA MOZES POGRESNO DA ZAKLJUCIS DA TI NE TREBA ONDA OPTIMISTIC CONCURRENCY CONTROL, ZA DAOKUMENTE U REPLICATED KOLEKCIJI

NE, TEBI TREBA OPTIMISTIC CONCURRENCY CONTROL ZA SVAKU KOLEKCIJU KOJU IMAS

BILO DA JE PRIMARN ILI NIJE

**JER SAMO TIM POMERANJEM VERZIJE MOZES DA OSIGURAS, DA NAPRAVIS PRAVILNU PROVERU DA LI TI JE INCOMMING EVENT IN ORDER SA ONIM STA TENUTNO IMAS**

**JER JEDNA STAR JE INCREMENTIRANJE VERSION-A, U PRIMARNOJ KOLEKCIJI, KADA TI `CREATE/UPDATE/DESTROY` DATA, A DRUGA STVAR OPTIMISTIC COMCURRENCY CONTROL**

TACNO JE D OPTIMISTIC CONCURRENCY CONTROL JESTE TO STO STOJI IZA SVAKE PROMENE version-A

ZASTO TI OVO GOVORIM?

PA U NASEM REAL EXAMPLE-U, TI IMAS `Tickets` KOLEKCIJU VEZANU ZA `tickets` MICROSERVICE, I TO JE NJEGOVA PRIMARNA KOLEKCIJA, IZ NJEGOVOG DATBASE-A

I IMAS REPLICATED `Tickets` KOLEKCIJU, KOJA JE TIED TO `orders`

**AKO ISSUE-UJES `"ticket:updated"`, TAJ EVENT CE EVENTUALLY DOCI DO `orders`, I ON CE IZVUCI Ticket IZ DATABASE-A, PROVERITI DA LI JE version ZA JEDINICU MANJI OD version-A KOJI JE DOSAO NA EVENTU, AKO JE SVE UREDU, UPDATE-OVACE REPLICATED Ticket**

**ALI NAJVAZNIJA STVAR JE DA CE REPLICATED Ticket PRI SAVINGU ISTO DOBITI NOVU VREDNOST ZA version, UVECANU ZA 1**

I TO NE TREBA DA BUDE SPORNO

JEDINA SPORNA STVAR O KOJOJ SMO MI GOVORILI OVDE JESTE DA NA PRIMER MI SLUCAJNO NE PROMENIMO Ticket U order MICROSERVICE-U I ONDA ISS-UJEMO EVENT DA JE TICKET PROMENJEN, JER BISMO TADA UPALI U POTENCIJALNE PROBLEME, O KOJIMA SMO GOVORILO RANIJE TOKOM OVOG BRANCHA U ZAMISLJENOM PRIMERU
