# CREATING GITHUB ACTION

***

digresija:

OPET TI NAPOMINJEM DA JE PULL REQUEST JEDNO, A ACTUAL MERGING DRUGO; PULL REQUEST JE REQUEST ZA MERGING, NA KOJI TI MOZES DA ODGOVORIS AKO SI AUTHORIZED, AKO SI VLASNIK REPO-A

SAMO JA RANIJE NISAM IMAO TAKVU PRAKSU; JA SAM MERGE-OVAO LOKALNO; **TADA NISAM KORISTIO NIKAKV PULL REQUEST** (I STO SE TICE OPEN SOURCE-A, JEDINI JE TAJ PULL REQUEST VALJAN NACIN DA SE NAPRAVI REQUEST DA SE TVOJE PROMENE APPLY-UJU)

DA SE SADA VRATIM NA TEMU

***

DODACEMO MALO CODE-A TO OUR GITHUB REPO-U ITSELF, KAKO BI SMO **OMOGUCILI DA SE RUNN-UJU TEST-OVI, SVAKI PUT KADA NAPRAVIMO PULL REQUEST**

**ZA TE POTREBE KORISTICEMO NESTO STO SE ZOVE `GITHUB ACTIONS`**

NA GITHUB-U SVAKI BUT KADA:

- `CODE BUDE PUSHED`

- `PULL REQUEST BUDE CREATED`

- `PULL REQUEST BUDE CLOSED`

- `REPOSITORY IS FORKED`

- I MNOGO DRUGIH STVAR ISE DOGODI

**DOGADJA SE `EVENT INTERNALY INSIDE GITHUB`**

`SVAKI PUT KDA SE DOGODI TAJ EVENT, MI MOZEMO DA RUNN-UJEMO GITHUB ACTION`

TO JE SCRIPT U KOJI MI MOZEMO STAVITI BILO KOJI CODE, KOJI ZELIMO, DA NEKAKO RUNN-UJEMO COMMANDS, TESTS, DEPLOYMENT; ANYTHING YOU CAN IMAGINE

# KREIRACEMO GITHUB ACTION, KOJI CE SE TRIGGER-OVATI SVAKI PUT, KADA SE KREIRA PULL REQUEST, ZA MERGINGOM INTO THE `main` BRANCH; TAKODJE CEMO SE POSTARATI DA SE TAJ ACTION RUNN-UJE I KADA SE PULL REQUEST UPDATE-UJE

U ACTIONU NAPISACEMO CODE, KOJI CE POGLEDATI SVAKI OD MICROSERVICE-OVA I RUNN-UJE TESTS INSIDE THEM

AKO BILO KOJI TEST OD NJIH FAIL-UJE FOR ANY REASON; BICE NAM RECENO NA PULL REQUEST-U, KOJI KREIRAMO; DAKLE BICE RECENO DA NESTO NIJE U REDU SA NASIM CODE-OM I DA MI TO TREBAMO DA POPRAVIMO

***
***

digresija:

[MORE INFO ABOUT GITHUB ACTIONS](https://docs.github.com/en/actions)

A NAJVAZNIJE STO MOZES PROCITATI JE OVO:

[EVENTS THAT TRIGGER WORKFLOWS](https://docs.github.com/en/actions/reference/events-that-trigger-workflows)

I TO CE TI RECI ABOUT ALL OF DIFFERENT THINGS, KOJE SE MOGU OCCURE-UJU INSIDE OF GITHUB, A STO CE KAO REZULTAT IMATI TRIGGERING GITHUB ACTION-A, I ESSENTIALLY RUNN-UJU SCRIPT, KOJI MI MOZEMO DA PODESIMO

***
***

# SADA CEMO DA PODESIMO NAS PRVI SCRIPT

IDEMO U [NAS REPO](https://github.com/Rade58/microticket), I SADA KLIKNI NA [Actions](https://github.com/Rade58/microticket/actions/new) TAB

ONDA CES MOCI BIRATI MNOGO VEC DEFINISANIH WORKFLOW-OVA, KOJI SU PUT TOGETHER FOR US

ALI MI CE MO WRITE-OVATI OUR OWN FROM SCRATCH

IDEMO NA `Simple workflow`; PRITISKAMO DUGME `Set up this workflow`

TI CES SADA BITI USTVARI PROMPTED DA EDIT-UJES `.yml` FILE

HIGHLIGHT-UJ SVE I DELETE-UJ

**MOZES FILE DA NAZOVES DRUGACIJE**

NAZVAO SAM GA `tests.yml`

SADA CEMO NAPISATI CODE, KOJI CE CONFIGURE-OVATI GITHUB ACTION

NAPISACEMO KONFIGURACIJU, KOJA CE RECI DA KADA BUDEMO ZELELI DA RUNN-UJEMO THIS ACTION, DA TAKODJE RUNN-UJEMO SCRIPT

U SLEDECEM

```yml
name: tests
# on odredjuje kada cemo runn-ujemo script
# a mi zelimo da to bude svakui put kada se kreira pull request
on:
  pull_request
```

ALI NECE SE RUNN-IVATI SAMO KKAD SE PULL REQUEST DOGODI, RUNN-OVACE SE I ZA OVE DRUGE SLUCAJEVE [KOJI SU OBJASNJENI NA OVAOJ STRANICI](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request)

DAKLE BICE RUNN-ED SVAKI PUT KADA SE DESAVA OVAJ ACTIVITI ZA PULL REUEST: `opened`, `synchronize`, OR `reopened`

DA NSTAVIMO SA PISANJEM

```yml
name: tests

on:
  pull_request
  
jobs:
  build:
    # DAKLE SVAKI PUT KADA SE DESI ACTION, KOJI JE POVEZAN SA PULL REQUEST
    # KADA PULL REQUEST BUDE CREATED, REOPENED ILI UPDATED 
    # TREBA DA SE POKRENE VIRTUAL MACHINE ,ODNOSNO CONTINER
    # KOJI CEMO DA RUNN-UJEMO N UBUNTU OPERATIVNOM SISTEMU
    runs-on: ubuntu-latest
    # A PRVA STVAR KOJ UZELIMO DA URADIMO U NASEM SCRIPT-U
    # JESTE UZIMANJE SVOG CODE-A IZ NASEG PROJECT-A
    # TO ODREDJUJE OVAJ uses FIELD    
    steps:
      - uses: actions/checkout@v2
    # PODESAVAMO SERIES OF COMANDS KOJE CE SE RUNN-OVATI INSIDE OF OUR PROJECT
    # SPECIFICIRAMO KOMANDU, KOJA CE RUNN-OVATI ALL THE TESTS
    # SAMO U NASEM auth MICROSERVICE-U
      - run: cd auth && npm install && npm run test:ci
```

**ZASTXO NISAM MOGAO NAPISATI SAMO `npm run test`, VEC SAM NAPISAO `npm run test:ci`**

TO JE USTVARI LITTLE GOTCHA KOJI CU TI USKORO OBJASNITI

NISMO MOGLI DA RUNN-UJEMO TESTS DIRECTLY (OBJASNICU TI ZASTO, VRLO BRZO)

DAKLE PROMENA KOJE SMO UNELI OMOGUCICE DA KADA NAPRAVIMO, UPDATE-UJEMO ILI REOPEN-UJEMO PULL REQUEST:

- INSTALIRACESE SE DEPENDANCIES ZA auth MICROSERVICE
- RUNN-OVACE SE TEST SCRIPT INSIDE OF IT

ZA SADA CEMO SAVE-OVATI, ODNOSNO COMMIT-OVATI, POMENUTI FILE KOJI SMO EDITOVALI U UI-U GITHUB-A

PRITISNI NA DESNO ZELENO DUGME `Start commit`; PA ONDA PRITISNI NA `Commit new file`

## DAKLE KREIRALI SMO NAS PRVI GITHUB HOOK, A SADA DA TI KAZEM STA CEMO URADITI

NAS ULTIMATE GOAL JESTE DA BUDEMO ABLE DA KREIRAMO PULL REQUEST I DA VIDIMO SVE TESTOVE, ZA NAS auth MICROSERVICE

- KREIRACEMO NOVI BRANCH U NASEM PROJEKTU, DAKLE LOKALNO

- PUSH-OOVACEMO TAJ BRANCH TO GITHUB REPO

- OPEN-OVACEMO PULL REQUEST

- I VIDECEMO STA CE SE DOGODITI

**MI SMO DODALI ONAJ TEST, KOJI IMA `:ci`, ODNONO SCRIPT `npm run test:ci`**

ZASTO SMO NAPISALI TAJ `:ci`

**TEST CE SE RUNN-OVATI INSIDE GITHUB ENVIROMENT, TACNIJE U CONTAINERU, KOJ ISI SPECIFICIRAO; I MI SE MORAMO UVERITI U TO DA NAS TEST SUITE EXIT-UJE AUTOMATSKI AT SOME POINT IN TIME**

NAS TEST SUITE RUNN-UJE U WATCH MODE-U

TO NE ZELIMO KADA RUNN-UJEMO TEST U GITHUB-U

ZELIM ODA NAS TEST EXIT-UJE

**ZATO MORAMO KREIRATI NOVI SCRIPR, KOJ ICE SE ZVATI `test:ci` I U KOJEM NECEMO IMPLEMENTIRATI WATCH MODE; DAKLE POSTARACEMO SE DA TEST RUNN-UJE EXACTLY ONCE I DA EXIT-UJE AUTOMATSKI**

- `code auth/package.json`

```json
// DODAO OVAJ SCRIPT
"test:ci": "jest"
```

# MEDJUTIM POSTO JA NISAM URADIO GIT INIT, U VEC ZAVRSENOM PROJEKTU, KAKO JE AUTOR WORKSHOPA URADIO; JA NECU IMATI ISTI FLOW KAO ON

ON JE, JER JE IMAO JEDINO main BRANCH, DALJE COMMIT-OVAO

NAPOMINJEM TI DA NECU OVO URADITI

- `git add -A`

- `git commit -m "something"`

- `git pull origin main` (DA BI UZELI ONE PROMENE VEZANE ZA yml FILE GITHUB ACTION-A)

PA JE ONDA PUSH-OVAO SVE DO mian

- `git puh origin main`

# MI CEMO DAKLE STVARI URADITI DRUGACIJE

NAPRAVICEMO NOVI BRANCH, PA CEMO GA MERGE-OVATI TO `main`

- `git add auth/package.json`

- `git commit -m "feat(auth/package.json) test script added"`

- `git checkout -b microticket_practice`

**ZELI MDA MERGE-UJEM TO `main`**

- `git checkout main`

- `git merge microticket_practice`

**SADA UZIMAMO ONE PROMENE KOJE SMO NAPRAVILI NA SAMOM GITHUB-U (GOVORIM O test.yml FILE-U)**

- `git pull origin main`

VIDECES U TERMINALU DA JE NAPISANO DA SI DOBIO OVO STO SE TICE FILE-OVA I FOLDER:

`.github/workflows/tests.yml`

DAKLE DOBIO SI ONAJ FILE, KOJI SI KREIRAO I EDITOVAO NA SAMOM GITHUB-U

# SADA CEMO PUSH-OVATI TO MAIN

- `git push origin main`


