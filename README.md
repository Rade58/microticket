# RUNNING TESTS IN PARALLEL

DO SADA NAM GITHUB WORKFLLOW IZGLEDA PRETTY GOOD; ALI SAMO RUNN-UJE TESTS ZA NAS auth MICROSERVICE

MORAMO SE POSTARATI DA SE TESTOVI RUNN-UJU I ZA NASE DRUGE MICROSERVICE-OVE, KADA SE DESI EVENT-OVI. VEZANI ZA PULL REQUEST, O KOJIMA SAM GOVORIO

## DAKLE, KONFIGURACIJE ZA GITHUB ACTION, MOGU ODEFINISATI DIREKTNO NA GITHUB-U, DEFINISANJEM INSIDE `.github/workflows` FOLDER-A, KOJEG SADA IMAMO U NASEM PROJECT-U

AUTOR WORKSHOPA TO RADI DIREKTNO NA GITHUB-U, IAKO TI I LOKALNO IMAS TAJ FOLDER, JER M ISAD IMAO `.github/workflows/tests.yml`,  UNASEM PROJECT-U

# MI MOZEMO SVE DEFINISATI IN ONE FILE, I MOGLI SMO DEFINISATI STRATING TEST KOMANDI IN SEQUENCE (SAMO BI STAVLJAO && ILI NOVE `- run` STEPOVE) ,ALI MI TO NECEMO URADITI

MI NE ZELIMO ZA SVE NASE TESTOVE DA IH RUNN-UJEMO IN SERIES, ODNOSNO KADA ZAVRSI JEDAN POCEO BI DRUGI, **TO BI POTRAJALO PA I NEKOLIKO MINUTA**

TEHNICKI POSTOJI DRUGI NACIN SA KOJIM MOZEMO WIRE-OVATI, SVE TESTING WOKFLOWS, KAKO BISMO OMOGUCILI DA SVI RUNN-UJU IN PARALELL

**MOZEMO DEFINISATI ADDITIONAL WORKFLOWS, KOJI CE SE EXECUTE-OVATI, ON `pull_request`**

## ZA POCETAK CEMO ON GITHUB EDIT-OVATI, VEC POSTOJECI yml FILE (`.github/workflows/tests.yml`), KOJI IMAMO, KAKO BISMO NAZNACILI DA JE REC O WORKFLOW-U NAMENJENOM ZA `auth` MICROSERVICE

PROMENICMEMO MU IME U `test-auth.yml`

I PROMENICEMO `name` NA `test-auth`

DAKLE OVO SAM ODRADIO DIEKTNO U REPO-U NA GITHUB, I PRITISNUO SAM NA COMMIT DUGME UPRAV TU U DASBOARD-U

JA SADA MOGU KOPIRATI SADRZAJ POMENUTOG FILE-A, I ISKORISTITI TO KAO NEK UPOLAZNU TACKU PRI PRAVLJANJU WORKFLOW FILE-OVA ZA DRUGE MICROSERVICE-OVE

EVO NAPRAVICU JOS JEDAN WORKFLOW FILE (RADIM TO DAKLE DIREKTNO NA GITHUB-U)

`.github/workflows/tests-tickets.yml`

I UKUPNO MENJAM DVE STVARI U SADRZINI, KOJU SAM PREKOPIRAO, IZ ONOG PRVOG FILE, KOJEG SAM NAPRAVIO

```yml
# EVO SAMO DEFINISEM OVO IME U tests-tickets
name: tests-tickets

on:
  pull_request

jobs:
  build:

    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      # I OVDE DEFINSEM `cd tickets`
      - run: cd cd tickets && npm install && npm run test:ci

```

KREIRACU I OSTALE 

I SADA ZNAS STA TREBAS DEFINISATI

## DAKLE OVO SMO URADILI DA NAM TESTS RUNN-UJU IN PARALLEL SVAKUI PUT KADA NAPRAVIMP PULL REQUEST, ILI UPDATE-UJEMO TAJ PULL 



