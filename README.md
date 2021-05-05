# U OKVIRU PUBLISHED EVENT-A, KADA TO, MI TREBAMO DA INCREMENTIRAMO I POSALJEMO ODNOSNO PUBLISH-UJEMO `version`, KOJI, USTVARI PUBLISH-UJEMO SA OSTAKOM DATA-E

PRVO CU TI RECI JESTE DA POGLEDAS VIDEO `19-17`

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

# SADA KADA OVO ZNAM, MOGU KONKRETNO DA ISPRVIM JEDNU GRESKU KOJ USAM NAPRAVIO U MOM REAL PROJECT-U

NAIME, JA SAM U `orders` MICROSERVICE-U, DEFINISAO MOGUCNOST DA DOKUMENTI `Tickets` KOLEKCIJE, USTVARI KORISTI OPTIMISTIC CONCURRENCY CONTROL

NJIMA TO NE TREBA, JER **KADA SE UPDATE-UJE Tickets DOKUMENT, U `orders` MICROSERVICE,U, A TICKETS NISU PRIMARNI DATA U orders MICROSERVICE-U, AK OSE POVECA `version`, POTENCIJALNO DALJE MOZE DOCI DO ISTOG PROBLEM, KOJ ISAM TI PREDSTAVIO U GORNJEM ZAMISLJENOM PRIMERU**

SADA CU DA POPRAVIM  SCHEMA-U ZA `Tickets` MODEL DA ON NE INCREMENTIR ,`version` DOKUMENTA, AKO SE DESI `CREATE/UPDATE/DESTROY`

**MEDJUTIM, OSTAVLJAM DA POSTIJI `version` PROPERI ,JER ON NIJE NI SPORAN, VEC JE SPORNO NJEGOVVO INCREMENTIARANJE NA NACIN, KOJI SAM TI OBJASNIO, I JA NE ZELI MTO INCRMENTIRANJE**











