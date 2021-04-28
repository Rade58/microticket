# FIXING FEW TESTS INSIDE `tickets` MICROSERVICE

AKO SADA POKUSAS DA RUNN-UJES TESTS VIDECES DA CE ONI FAIL-OVATI

**PRVENSTVENO ZATO STO ZA `NATS STREMING SERVER` NEMAS NIKAKV IN MEMORY SERVICE, KAO STO JE `IN MEMORY MONGO DB`, KOJU SI KORISTIO SVAKI PUT KADA SI TESTIRAO HANDLERE**

- `cd tickets`

- `yarn test`

**ZAISTA, IMAS TONS OF FAILIURE**

A EVO KOJU ERROR PORUKU MOZES PROCITATI IZ OUTPUTA

```sh
console.error
      Error: Can't access NATS Streaming Server before connecting.
```

TI SI DEFINISAO DA SE TAJ ERROR THROW-UJE AKO SE KORISTI client GETTER NA `NatsWrapper` INSTANCI, U SLUCAJU DA JE undefined

A undefined JE KADA NEMA USPESNE KONEKCIJE N NATS STREAMING SERVER

# ERROR SE DOGADJA JER PUBLISHERS FAIL-UJU

DAKLE U DVA HANDLERA POKUSAVANM DA PUBLISH-UJEM, A TO THROW-UJE ERRORS DO ERROR HANDLING MIDDLEWARE-A

**ERROR JE THROWN JER STAN CLIENT KOJI PRI PUBLISHINGU KORISTIS, USTVARI NE POSTOJI**

**USTVARI POSTOJI ALI JE UNINITIALIZED, JER NIJE NA NJEMU ODREDJENA CONNECTING LOGIKA**

**JER NATS SE INICIJALIJUE, ODNONO KONEKTUJE U index.ts FILE, DOK TI TESTIRAS SAMO `app.ts` I SVU LOGIKU KOJA IDE UZ TO**

U SAMIM HANDLERIMA ZBOG TOGA SE NISTA DEFINISANO NAKON PUBLISHINGA I NE MOZE IZVRSITI ZBOG TOGA

# OVO MOZES RESITI NA NEKOLIKO NACINA

MOZES DEFINISATI DA SE I PRILIKOM TESTIRANJA USTVARI ACCESS-UJE NAS NATS STREAMING SERVER U CLUSTERU

I NE BI NAM BILO PRVOI PUT DA ACCESS-UJEMO NATS FROM OUTSIDE OF THE CLUSTER (TO SMO RADILI I U NASEM "PLAYING AROUND WITH NATS" SUBPROJECTU (nats_test_project))

**ALI TO NE BI BILO SUPER IDEL, JER NECEMO DA ASUME-UJEMO DA MORAMO DA IMAMO INSTANCU NAT STREAMING SERVERA KADA TREBA DA RUNN-UJEMO TESTS** (TO REQUIRE-UJE DA IMAMO NATS STREMING SERVER UVEK NA NEKOM CLUSTERU ILI NASOJ LOKALNOJ MACHINE-I)

## MI CEMO USTVARI KORISTITI JEDAN FANCY LITTLE FEATURE INSIDE JEST, A U CILJU CONNECTINGA TO `FAKE NATS CLIENT`

JEST USTVARI MOZE INTERCEPT-OVTI IMPORT KOJI MU DEFINISES DA GA INTERCEPT-UJE I UVEZE U FILE POTPUNO NESTO DRUGO OD ONOGA ORIGINLY INTENTED

MI CEMO UCINITI DA ON INTERCEPT-UJE IMPORTE ZA `tickets/src/events/nats-wrapper.ts`, ODNONO ZA `NatsWrapper` KLASU, I UMESTO TOG CE SE SERVE-OVATI FAKE NATS CLIENT KOJI CEMO DEFINISATI NEGDE DRUGDE

**TAJ FAKE NATS CLIENT BICE USTVARI INITIALIZED (CONNECTED TO NATS STREAMING SERVER) NATS CLIENT**

# MOCKING (FAKING) IMPORTS WITH JEST

EVO KAKO CE ICI TAJ PROCES MOCKINGA

- ODREDI FILE KOJI ZELIS DA FAKE-UJES

- U ISTOM DIREKTORIJUMU GDE JE POMENUTI FILE, DODAJ I `__mocks__` DIRECTORY

- U POMENUTOM FOLDERU KREIRAJ FILE KOJI IMA IDENTICNO IME FILE-A KOJEG ZELIS DA FAKE-UJES

- U TOM FILE-U INSIDE `__mocks__` NAPISI FAKE IMPLEMENTATION

- RECI JESTU DA KORISTI TAJ FAKE FILE U NASIM TESTOVIMA (TO CES DEFINISATI U SAMIM TEST FILE-OVIMA)

***
***

U NASEM SLUCAJU FILE KOJI ZELIMO DA FAKE-UJEMO JE `tickets/src/events/nats-wrapper.ts`

ZATO KREIRAMO `__mocks__` FOLDER OVDE:

- `mkdir tickets/src/events/__mocks__`

KRIRAMO ISTOIMENI FILE INSIDE `__mocks__` FOLDER

- `touch tickets/src/events/__mocks__/nats-wrapper.ts`

SAD MOZES DA WRITE-UJES FAKE IMPLEMENTATION

```ts
// POSTO REAL IMPLEMENTATION RETURN-UJE INSTANCU
// TO JEST OBJEKAT SA client GETTEROM
// I connect METODOM, JA BI TO TREBALO DA MOCK-UJEM

export const natsWrapper = {
  // client: ,
  // connect: ,
};

// VRATICEMO SE UBRZO NA PISANJE FAKE IMPLEMENTACIJE

```

SADA CEMO RECI JESTU DA KORISTI POMENUTI FILE, UMESTO REAL ONE

**POSTOJI NEKOLIKO MESTA GDE MORAMO RECI JESTU DA INTERCEPT-UJE UVOZ I SERVIRA EXPORT FROM FAKE FILE**

**POSTO NATS KORISTIMO KADA KREIRAMO I KADA UPDATE-UJEMO TICKET (KADA KORISTIMO PUBLISHING), TAMO MORAM OD NAPISEM SPECIJALI CODE, CIJE JE ULOGA DA INTERCEPT-UJE UVOZ I SERVIRA EXPORT IZ MOCK FILE-A**

TO SU ROUTES KOJE SMO DAVNO RANIJE TESTIRALI

- `tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

// PISEMO SLEDECE
jest.mock(
  // SPECIFICIRAMO PATH DO NORMALNOG FILE-A
  "../../events/nats-wrapper"
);
// KADA GODE EXECUTE-UJES TESTS JEST CE VIDETI KOJI FILE POKUSAVAS
// DA MOCK-UJES
// UMESTO IMORTINGA REAL FILE, JEST CE DA IMPORT-UJE ONAJ
// MODUL, ISTOIMENOG FILE-A IZ __mocks__ FOLDERA

// ...
// OSTATAC CODE TESTOVA TI NECU OVDE PRIKAZATI JER CU SAMO 
// POLUTE-OVATI MD FILE I NECE BITI LEPO CITLJIV
```

**MOZEMO OVO ODMAH DA TESTIRAMO,, IAKO JOS NISMO IMPLEMENTIRALI NISTA VAZNO INSIDE FAKE FAILE**

ALI ZELIM DA VIDIM NEKE DRUGACIJE ERROR MESSAGE-OVE OVOK PUTA

- `cd tickets`

- `yarn test`
