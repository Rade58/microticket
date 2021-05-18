# RUNNING TESTS ON PR CREATION

***
***

digresija:

**RESI OVO ODMAH, U SVIM MICROSERVICE-OVIMA, A TICE SE TESTOVAA I TYPESCRIPT-A; I NJIHOVOG FAILINGA U CONTAINERU GITHUB-A, KOJI ON SPINN-UJE ZA RUNNING ACTION-A**

INSTALIRAJ U SVIM MICROSERVICE-OVIMA, TYPE-OVE ZA JEST

- `cd <microservice>`

- `yarn add @types/jest --dev`

***
***

DAKLE PODESILI SMO NAS GITHUB ACTION, URADILI SVE STA SMO URADILI

- `cat .github/workflows/tests.yml`

```yml
name: tests
# 
on:
  pull_request
  
jobs:
  build:

    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - run: cd auth && npm install && npm run test:ci

```

NECU SE PONAVLJATI, CITAJ PROSLI BRANCH AKO TE ZANIMA STA SAM RADIO

SADA CEMO KONACNO RADITI ONAJ WORKFLOW KOJI SAM POMINJAO, I KOJI AUTOR WORKSHOPA VOLI DA KORISTI

***
***

**LOCAL MACHINE**

- MAKE CHANGES TO YOUR CODEBASE, ILI DO TVOG JEDNOG MICROSERVICE-A

- COMMIT-UJ CODE TO ANY BRANCH, OSIM master ILI main BRANCH-A

- PUSH-UJ BRANCH TO GITHUB

**GITHUB**

- GITHUB RECEIVES UPDATED BRANCH

- TI MANUELNO PRAVIS PULL REQUEST TO MERGE UPDATED BRANCH TO THE main

- GITHUB AUTOMATICALLY RUNS TESTS FOR PROJCT

- NAKON STO TEST-OVI PASS-UJU; TI MERGE-UJES PR (PULL REQUEST) U main BRANCH

- POSTO JE main BRANCH PROMENJEEN; GITHUB TREBA DA BUILD-UJE I DEPLOY-UJE U NAS LIVE KUBERNATES CLUSTER

***
***

**ON LOCAL MACHINE**

# 1. DAKLE PRVO CEMO IZMENITI NEKI FILE

UBACI NEKI `console.log` BILO GDE U `auth` MICROSERVICE-u

NE MORAS NISTA DA COMMIT-UJES U TRENUTNOM BRANCH-U (NA PRIMER MI SMO IN `main` BRANCH)

I TU DAKLE NISTA NE COMMIT-UJEMO

CTITICAL PART JE DA NIST NE COMMIT-UJEMO U `main` BRANCH-U

# 2. NAPTRAVI NOVI BRANCH, I COMMIT-OVACU CODE TO THAT BRANCH

- `git checkout -b dev`

- `git add -A`

- `git commit -am "feat(auth/src/index.ts) added a console log"`

# 3. PUSH-UJEM NOVI BRANCH, KOJI SAM NAZVAO `dev`, TO THE GITHUB

- `git push origin dev`

***

digresija:

AKO SE SECAS MI KOTISTIMO INCE `git push -u origin <branch>` (TO RADIMO KAKO NE BISMO MORLI STALNO DA RADIMO `git push origin` ,VEC DA SLEDECI PUT MOZEMO DA KUCAMO SAMO `git push`)

***
***
***

**ON GITHUB**

1. OTVORI `Pull requests` TAB

MOZES KLIKNUTI NA ONO `Compare & pull request`; ALI MI CEMO SADA NAPRAVITI PULL REQUEST MANUALLY; TAKO DA KLIKNI NA `New Pull Request`

SADA SI U NEKOM DIALOGU `Compare changes`

I U TU U PADJUCIM MENU-OVIMA MOZES DA BIRAS BRANCH-EVE

KAO `base` BRANCH PODESAVAS `main`; A KAO `compare` BRANCH PODESAVAS `dev`

SADA MOZES DA KLIKNES NA `Create Pull Request`

SADA CES BITI PROMPTED DA DODAS TITLE ZA PULL REQUEST I DA UNESES MESSAGE, KAO NEKI DESCRIPTION ABOUT CHANGES YOU WANT TO MAKE

I ONDA KLIKNES NA `Create Pull Request`

KADA SMO TO URADILI: **TO CE TRIGGER-OVATI NOVI EVENT NA GITHUB-U**

**I TAJ EVENT BI TREBAL ODA TRIGGER-UJE GITHUB ACTION, KOJI SMO DEFINISALI**

`MOCI CES DA VIDIS ZUTOM BOJOM OZNACENI BOX, I U NJEMU NATPIS "Some checks havent completed yet"`

**TO JE TVOJ GITHUB ACTION BEING EXECUTED**

I MOZES KLIKNUTI NA `Details` DUGME

VIDECES INFORMATIONS ABOUT RUNNING JOBS

TU CES VIDETI SVE LOGS ZA ONO STA SI PODESIO DA SE RUNN-UJE, DEFINISUCI ONAJ ACTION `.github/workflows/tests.yml`

MOCI CES DA VIDIS INSTLACIJU MODULA

ZATIM I RUNNING TESTOVA

**SVI TESTOVI SU PASS-OVALI**

DA NISU PASS-OVALI TAJ STEP NE BI BIO RESOLVED SUCCESSFULLY (I TO TI BI BILO RECONO)

ZA SADA NASI TESTOVI JESU PROSLI

VIDECES GREEN CHECKBOX KOJI TI UKAZUJU DA JE SVE PROSLO KAKO TREBA

2. SADA MOZES DA U OKVIRU PULL REQUEST DIALOGA, KOJI TI JE OTVORE, TI PRITISNES NA `Conversation` TAB

TU CES VIDETI ZELENE CHACKAMARKS ZA `All tests have passed` i `this branch has no conflicts with base branch`

I MOCI CES DA VIDIS ZELENO DUGME `Merge pull request`

***
***

NECEMO JOS PRITISNUTI `Merge pull request` ,KAKO BI MERG-OVALI INTO OUR `main` BRANCH

JER ZELIM DA TI POKAZEM STA BI SE DESILO, KADA BI NEKI OD NASIH TESTOVA FAIL-OVAO FOR SOME REASON

***
***

# DODACI ADDITIONAL COMMIT, DO POMENUTOG PULL REQUEST-A ;ALI PRE TOGA CEMO NAPRAVITI BREAKING CHANGE TO SOME OF OUR TESTS U `auth` MICROSERVICE-U; I TO RADIM DA VIDIM STA CE SE DOGODITI AKO NAPRAVIM BREAKING CHANGE TO SOME OF OUR TEST

**ONO STO OCEKUJEM DA CE SE DOGODITI SA PULL REQUESTOM, JESTE DA U IMATI SIGN, KOJI CE RECI DA NESTO NE VLJA I DA NE BITREBALI DA NAPRAVIMO MERGE, VEC DA POPRAVIM OCODE, PRE NEGO STO MERGE-UJEMO INTO THE `main` BRANCH**

IZABERI BILO KOJI TEST ODANDE I PROMENIO NEKI EXPECTATION DA BUDE NETACAN

NARAVNO TI MOZES DA ZAMISLIS DA SMO MI KAO NAPRAVILI NEKE PROMENE U NASEM CODEBASE, I DA CE ZATO TEST FAIL-OVATI (JER SE TO REALNO DESAVA)

URADIO SAM TO I SADA CU DA COMMIT-UJEM

- `git add -A`

- `git commit -am 'purposly failing some expectation inside test of auth microservice'`

- `git push origin dev`

***
***

**NA GITHUB-U, POSTO SMO VEC NAPRAVILI PULL REQUEST, ZA `dev` BRANCH, MI TO NE MORAMO DA RADIMO I DRUGI PUT, ODNOSNO OVAJ PUT**

**ONE, ODNOSNO CHANGES ,POSTO IH PRAVIM OZA SAME BRANCH, CE BITI ADDED KAO ADDITIONAL CHANGES TO THE PULL REQUEST, KOJI SMO KREIRALI**

POSTO SMO PUSH-OVALI PRIMETICES NA GITHUBU U OKVIRU VEC POMENUTOG PULL REQUESTA; COMMIT KOJI SMO NAPRAVILI

***
***

**OPET IMAMO ZUTI BOX I OPET PISE `Some checks haven't completed yet`, I OPET SE POKRENUO GITHUB ACTION KOJ ISMOO DEFINISALI, I ZATO, POSTO SMO SADA `TRIGGER-OVALI UPDATE EVENT, NA PULL REQUESTU` A RANIJE SMO REKLI DA CE NAS ACTION RUNN-OVATI I KADA SE DESI TAJ EVENT**

**DAKLE OVERAL WORKFLOW, JE FAILED, ZATO STO JE JEDAN STEP FAILED, I MICEMO VIDETI CRVENI `X`**

IDEMO U `Conversation` TAB

I TAMO CES MOCI DA VIDIS PORED CRVENNOG `X` DA PISE I `All checks have failed`

**MI I DALJE MOZEMO DA MERGE-UJEMO PULL REQUEST INTO `main`; ALI ZASTO BISMO TO URADILI, KAD OCIGLEDNO NESTO NIJE U REDU**

DAKLE OVO NAS ENCOURAGE-UJE DA POPRAVIMO NAS CODEBASE, PRE NEGO STO MERGE-UJEMO CHANGES INTO MASTER

# IDEMO U NAS CODEBASE DA POPRAVIMO GRESKU, I DA ONDA PONOVO COMMIT-UJEMO I PUSH-UJEMO

- NAPRAVILI SMO POPRAVKU U CODEBASE (POPRAVILI ONAJ BROKEN EXPECTATION U TESTU VEZANOM ZA auth MICROSERVICE)

***

digresija:

U NEKOM REAL WORLD SCENARIO-U, TI BI SADA RUNN-OVAO TET I LOKALNO I STARAO SE DA TI PRODJE (MISLIM DA TI JE TO JASNO)

***

- `git add -A`

- `git commit -am 'fixed broken expectation inside test for auth'`

- `git push origin dev`

I OPET SE EVENT TRIGGERUJE NA GITHUB-U, ZA NAS PULL REQUEST, STO MOZEMO I VIDETI

OPET VIDIMO DA JE BOX POZUTEO I DA U NJEMU PISE `Some checks haven't completed yet` ,I MOZEMO VIDETI DETAILS I VIDIMO LOGS, I VIDIMO DA SU NAM TESTOVI PASS-OVALI

MOZEMO DA KLIKNEMO NA `Conversation` TAB I TAMO MOZEMO VIDETI ZELENE CHECKAMRKS, KAKO SAM TI I RANIJE OBJASNIO

**SADA MOZEMO DA MERGE-UJEMO PULL REQUEST INTO `main` BRANCH**

PRITISKAMO `Merge pull request`
