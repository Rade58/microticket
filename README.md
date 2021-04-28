# TESTS FOR ENSURING MOCK INVOCATION

U PROSLOM BRANCHU SI NAPRAVIO MOCK, KOJIM USPESNO MOCK-UJES, USTVARI, KORISCENJE INSTANCE KOJU EXPORT-UJES IZ OVOG FILE-A: `tickets/src/events/nats-wrapper.ts`

MEDJUTIM TI U TOM PROCESU SI MOCKOVAO SAM PUBLISHING EVENT-A

NIJE NISTA PUBLISHOVANO; ODNOSNO N IJEDAN EVENT NIJE PUBLISHED

JER TI SI HIGHJACK-OVAO NATS CLIENT-A, I USTVARI SI UMESTO TOGA KORISTIO NESTO STO SI SAM DEFINISAO

KAO STO VIDIS OVDE NEMA REAL NATS CLIENT-A, I NEMA REAL publish METODE

- `cat tickets/src/events/__mocks__/nats-wrapper.ts`

```ts
export const natsWrapper = {
  client: {
    publish(channelName: string, data: any, callback: () => void): void {

      callback();
    },
  },
};
```

A EVO KAKO IZGLEDA POZIVANJE TE FUNKCIJE; DAKLE SLEDECI CODE CE SE IZVRSITI PRILIKO TESTOVA, JER TI SLEDCEU FUNKCIJU POZIVAJ U HANDLERU KOJEG TESTIRAS 

- `cat common/src/events/abstr/abstr-publisher.ts`

```ts
// ...

publish(data: T["data"]) {
  const jsonData = JSON.stringify(data);

  // EVO GA UPOTREBA GORNJEG CLIENT ZA
  // KOJI SAM PISAO MOCK
  const stan = this.stanClient;
  // ---------------------------------

  const channelName = this.channelName;

  return new Promise<void>((res, rej) => {

    // ---- EVO OVDE IMAS POZIVANJE FUNKCIJE KOJI SI
    //                MOCKOVAO IZNAD          ----

    stan.publish(
      channelName,
      jsonData,
      /**
       *
       * @param error Error | undefined
       */
      (error) => {

        // EVO GA I CALLBACK CIJE SI TI POZIVANJE U MOCK-U
        // DEFINISAO

        // error TADA NISI NI PROSLEDIO (TI TO I NERADIS VEC MOGUCI FAILIRE PRI PUBLISHINGU)
        // I OVO SE TADA NIJE IZVRSILO
        if (error) {
          return rej(error);
        }

        // OVO JE ONO STO SE STAMPALO U TEST SUITE-U
        console.log(`
          Event Published
          Channel: ${this.channelName}
        `);

        // I OVAJ CLOSURE OVDE SE IZVRSIO
        // KAKO BI RESOLVE-OVAO PROMISE
        res();
      }
    );

  // ---------------------------------------


  });
}


// ...
```

ALI GDE JE U SVEMU TOME REAL NATS CLIENT

**PA NEMA GA, JER SI I ZELEO DA GA NE BUDE TOKOM TESTOVA**

**`ALI KAKO ONDA TESTIRATI ACTUAL PUBLISHING EVENT-OVA ????`**

AKO HOCU DA SE STVARNO UVERIM DA LI SE PUBLISH-UJE EVENT DO NATS STREAMING SERVER-A; MORAM SE UVERITI DA LI SE `STVARNO EXECUTE-UJE client.publish FUNKCIJA`

KADA SE TA FUNKCIJA POZIVA TO ZNACI 100% DA MI POKUSAVAMO DA POSALJEMO EVENT

ALI TI NE MORAS KORISTITI FAKE IMPLEMENTATION, KAKAV SI TI DEFINISAO, MOZES KORISTITI NESTO STO SE ZOVE MOCK FUNCTION

# MOCK FUNCTION (`jest.fn`)

MOCK FUNCTION JESTE ESSENTIALLY A FAKE FUNKCIJA, ALI DOZVOLJAVA DAA PODESAVAM EXPECTATIONS AROUND IT

ODNOSNO DOZVOLJAVA MI DA PRAVIM ASSERTIONS

N PRIMER MOGU PRAVITI EXPECTATION DA LI CE SE FUNKCIJE EXECUTOVATI, ILI PRAVITI EXPECTATION SA KOJIM CE SE PARTICULAR ARGUMENTIMA IZVRSITI FUNKCIJA

- `code tickets/src/events/__mocks__/nats-wrapper.ts`

```ts
export const natsWrapper = {
  client: {
    // EVO, UMESTO OVE FAKE FUNKCIJE
    /* publish(channelName: string, data: any, callback: () => void): void {
      callback();
    }, */
    // JA MOGU DA POZOVEM OVO MOCK FUNKCIJU
    publish: jest.fn(),
  },
};
```

**TO JE FUNKCIJA THAT CAN BE CALLED FROM ANYTHING INSIDE OF OUR APPLICATION**

**TA FUNKCIJA INTERNALY, KEEP-OVACE TRACK O TOME DA LI JE POZVANA, KOJI SU JOJ ARGUMENTS PROVIDED PRILIKOM CALL-A, I DRUGO,; SVE U CILJU DA MOGU DEFINISATI EXPECATAIONS AROUND IT**

# ALI TI I DALJE MORAS IMATI ONAJ FAKE DEO KOJI SI DEFINISAO; I ZATO MORAS KORISTITI I `.mockImplementation` METODU

TI NISI PASS-OVAO NISTA INSIDE jest.fn()

TEBI CE ZBOG TOGA TESTOVI FAIL-OVATI JER KAO STO ZNAS TREBAJU TI SVI ONI PARAMETRI ZA client.publish FUNKCIJU; A NAJVAZNIJI JE CALLBACK PARMAETAR

- `code tickets/src/events/__mocks__/nats-wrapper.ts`

UPRAVO CES ZATO KORISTITI `.mockImplementation()`

```ts
export const natsWrapper = {
  client: {
    /* publish(channelName: string, data: any, callback: () => void): void {
      callback();
    }, */

    // DAKLE PASS-UJEMO IN POMENUTU FAKE FUNKCIJU
    // KROZ METOFU mockImplementation
    publish: jest
      .fn()
      .mockImplementation(
        (channelName: string, data: any, callback: () => void): void => {
          //
          //
          //
          // I DALJE DAKLE OVDE MORAMO
          // PZVATI callback
          callback();
        }
      ),
  },
};
```

HAJDE PRVO DA VIDIMO DA LI NASI TESTOVI I DALJE PROLAZE

- `cd tickets` `yarn test`

PROLAZE TESTOVI (OPET TI NAPOMINJEM NA ONAJ PROBLEM RUNNINGA TESTING SUITE, SA TYPESCRIPTOM (FAIL-OVACE ALLI TI U TOM SLUCAJ URESTARTUJ TESTING))

## MI SADA MOZEMO PISATI ACTUAL ASSERTION KAKO BISMO SE UVERILI DA JE GORNJA FAKE FUNKCIJA, ZIASTA INVOKED, ILI ASSERTION SA KOJIM ARGUMENTIMA JE ONA IZVRSENA

PRVO CEMO IZVRSITI NEKE ASSERTION VEZANE ZA HANDLER, KOJI SLUZI ZA MAKING NEW TICKET-A

**ALI MI CEMO U TEST FILE UVESTI ONU STVAR KOJU MOCK-UJEMO**

I OVO CE TI BITI CUDNO, USTVARI TI MISLIS ZASTO MI TO RADIMO?

PA D BISMO TU STVAR TESTIRALI, U OVOM SLUCJU, TREBACE NAM UPRAVO TA STVAR

**ODNOSNO KORISTICEMO IMPORT DA UVEZEMO REAL STVAR, ALI POSTO SI TI DEFINISAO ONAJ INTERCEPTING IMPORTA (`jest.mock` INSIDE `tickets/src/test/setup.ts`), BICE UVEZENA USTVARI FAKE STVAR**

MI TO MOZEMO I ISPITATI

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

// EVO UVOZIM POMENUTI FILE, NARAVNO RELATIVNO TO THIS FILE
// DAKLE TI UVEZIS PRVI FILE, ALI OCEKUJES DA CE BITI UVEZENO
// ONO IZ MOCKED ONE-A
import { natsWrapper } from "../../events/nats-wrapper";
// JA CU TO STMAPTI DA BI PROVERIO

// ...
// ... 

it("publishes an event", async () => {
  // PRVO CEMO KREIRATI NOVI TICKET
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: "nebula", price: 69 })
    .expect(201);

  // A STAMPACEMO ONAJ IMPORT
  // DA TI POKAZEM DA CE SE STAMPATI MOCK MODUL
  // UMESTO THE REAL ONE
  console.log(natsWrapper);
  //
});
```
EVO VIDIS

NIJE UVEZEN ONAJ ORIGINAL `tickets/src/events/nats-wrapper.ts`

VEC JE UVEZEN `tickets/src/events/__mocks__/nats-wrapper.ts`

**DAKLE ZAIST JE IMPORTED ONO STO SI TI DEFINISAO, A TO PROIZILAZI IZ `.mockImplementation`, KOJU SI UPOTREBIO U MOCKED FILE-U**

```zsh
console.log
      {
        client: {
          publish: [Function: mockConstructor] {
            _isMockFunction: true,
            getMockImplementation: [Function (anonymous)],
            mock: [Getter/Setter],
            mockClear: [Function (anonymous)],
            mockReset: [Function (anonymous)],
            mockRestore: [Function (anonymous)],
            mockReturnValueOnce: [Function (anonymous)],
            mockResolvedValueOnce: [Function (anonymous)],
            mockRejectedValueOnce: [Function (anonymous)],
            mockReturnValue: [Function (anonymous)],
            mockResolvedValue: [Function (anonymous)],
            mockRejectedValue: [Function (anonymous)],
            mockImplementationOnce: [Function (anonymous)],
            mockImplementation: [Function (anonymous)],
            mockReturnThis: [Function (anonymous)],
            mockName: [Function (anonymous)],
            getMockName: [Function (anonymous)]
          }
        }
      }

```

GORE VIDIM BUNCH OF HELPERS KOJI CE OMOGUCITI A MOGU DA PRAVIM NEKE ASSERTIONS U VEZI MOCKED FUNKCIJE 

## POCECU SADA SA PISANJEM ASSERTION-A

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

import { natsWrapper } from "../../events/nats-wrapper";

// ...
// ...

it("publishes an event", async () => {
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: "nebula", price: 69 })
    .expect(201);

  console.log(natsWrapper);

  // ASSERTION KOJIM TVRDIM DA JE FUNKCIJA USTVARI POZVANA
  // DA JE SUCCESSFULY BILA INVOKED
  // NAKON KREIRANJA TICKET
  // BITNO JE STO SI GORE KREIRAO TICKET, JER HANDLER UNDER THE HOOD
  // ZOVE FUNKCIJU

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
```

OVAJ TEST CE PROCI, MOZES DA PROBAS I SAM `cd tickets` `yarn test`

#@ MEDJUTIM KADA UPOTREBI `.mockImplemntation`, TO ZNACI DA CE SE ISTA DOBIJEN MOCK FUNKCIJA REUSE-OVATI ZA EVERY SINGLE ONE OF OUR TESTS

ZATO BETWEEN EACH OF OUT TEST TREBALO BI DA RESET-UJEMO MOCK FUNKCIJU

SVE ZBOG TOGA STO MOCK FUNKCIJA INTERNALY RECORD-UJE HAOW MANY TIME IS CALLED, SA KOJIM ARGUMENTIMA JE CALLED

I EVENTUALLY MI ZELIM ODA PISEMO DIFFERENT EXPECTATIONS AROUND NUMBER OF CALLS, AROUND ARGUMENTS AND SO ON

**DAKLE ZELIMO DA BETWEEN EVERY SINGLE TEST MI RESET-UJEMO TAJ DATA**

**NE ZELIM SITUACIJU U KOJOJ CE DATA JEDNOG TESTA DA POLUTE-UJE ANOTHER TET**

# RESETOVANJE MOCK-OVA SA `jest.clearAllMocks()`

- `code tickets/src/test/setup.ts`

TO RADDIMO U beforeEach HOOK-U

```ts
// ...
// ...


beforeEach(async () => {
  // EVO OVO DEFINISEM
  jest.clearAllMocks();
  //

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});


// ...
// ...
```

DOBRO SADA NE MORAS DA STRAHUJES DA CE SE U JEDNOM TESTU, U KOJEM KORISTIS MOCK, PRELITI IDATA ISTOG MOCK-A IZ NEKOG DRUGOG TESTA

OPET MOZES DA PROBAS DA TESTIRAS 

## USTVARI SADA CEMO NAPISATI TEST ZA update HANDLERA

- `code tickets/src/routes/__tests__/update.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

import { Types } from "mongoose";


// UVOZIMO ONU FUNKCIJU
// A UMESTO KOJE SE SERVIRA MOCK
import {natsWrapper} from '../../events/nats-wrapper' 
// VEC SAM MNOGO PUTA REKAO RANIJE ASTO SE UVOZI REAL THING I ZASTO JE OVDE TO INTERCEPTED
// I SERVIRAN JE MOCK

// ...
// ...


import request from "supertest";
import { app } from "../../app";

import { Types } from "mongoose";

// UVOZIMO ONU FUNKCIJU
// A UMESTO KOJE SE SERVIRA MOCK
import { natsWrapper } from "../../events/nats-wrapper";
// VEC SAM MNOGO PUTA REKAO RANIJE ASTO SE UVOZI REAL THING I ZASTO JE OVDE TO INTERCEPTED
// I SERVIRAN JE MOCK

const titleCreate = "Stavros ey";
const priceCreate = 602;

const title = "Nick hola";
const price = 406;

/**
 * @description id OF THE TICKET CAN BE OBTAINED FROM THE .body
 * @description userId OF THE TICKET CAN BE OBTAINED FROM THE .body
 */
const createTicketResponse = async () =>
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: titleCreate, price: priceCreate });

it("if ticket with that id doesn't exist, return 400", async () => {
  const randomId = new Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${randomId}`)
    .set("Cookie", global.getCookie())
    .send({ title, price })
    .expect(404);
});

// DODACI U TEST KOJI PROVERAVA SAMO DA LI POSTOJI KORISNIK
it("if there is no authenticated user, it returns 401", async () => {
  const response = await createTicketResponse();

  const { id } = response.body;

  // SLACU REQUEST BEZ COOKIE-A I OCEKUJEM 401

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title, price })
    .expect(401);
});

// NASTAVLJAM SA OVIM TESTOM ZA KOJI SAM REKAO DA CU GA PISATI

it("if the user does not own a ticket, return 401", async () => {
  // NASTAVLJAM SA OVIM TESTOM
  // CREATING A TICKET
  const response = await createTicketResponse();

  // TICKET ID
  const { id } = response.body;

  // TRYING AN TICKET UPDATE BUT WITH DIFFERENT CREDENTIALS
  await request(app)
    .put(`/api/tickets/${id}`)
    // COOKIE BUT WITH DIFFERENT JWT
    .set(
      "Cookie",
      global.getOtherCookie({ email: "otherguy@test.com", id: "sdfdsdgfd34" })
    )
    //
    .send({ title, price })
    .expect(401);

  const response2 = await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response2.body.title).toEqual(response.body.title);
  expect(response2.body.price).toEqual(response.body.price);
});

// -------------------

// ...

it("returns 400, if price or title is invalid", async () => {
  // OVDE NECU PRAVITI NIKAKV NOVI TICKET
  // JER PLANIRA DA U HANDLERU DAKLE RETURN-UJEM EARLY
  // AKO JE NEKI INPUT INVALID
  // (ZATO STO CU KORISTITI validateRequest MIDDLEWARE
  // KOJI CE THROW-OVATI ONE ERRORS, KOJE CE U REQUEST UBACITI
  // body-JI (MIDDLEWARE-OVI express-validator-A KOJE CU ISTIO POSTAVITI))

  await request(app)
    // ZATO GENERISEM id NA SLEDECI NACIN
    .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
    .set("Cookie", global.getCookie())
    // UBACICU NESTO NEVALIDNO
    .send({
      price: -90,
      title: "Something",
    })
    .expect(400);

  //

  await request(app)
    .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
    .set("Cookie", global.getCookie())
    // UBACICU NESTO NEVALIDNO
    .send({
      price: 306,
      title: "",
    })
    .expect(400);
});

//  --------------------
//...
it("updates the ticket, and returns 201", async () => {
  const cookie = global.getCookie();

  // CREATING TICKET
  const response = await createTicketResponse();

  const { id } = response.body;

  // UPDATING TICKET
  const response2 = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "Grendel is home",
      price: 66,
    });

  // 201 ASSERTION
  expect(response2.status).toEqual(201);

  // GETTING THE UPDATED TICKET
  const response3 = await request(app)
    .get(`/api/ticket/${response2.body.id}`)
    .set("Cookie", cookie)
    .send();

  // ASSERTION ABOUT FIELDS
  expect(response3.body.title).toEqual(response3.body.title);
  expect(response3.body.price).toEqual(response3.body.price);
});

it("event to be published", async () => {
  const response = await createTicketResponse();
  const { id } = response.body;

  // UPDATE-UJEMO
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.getCookie())
    .send({
      title,
      price,
    })
    .expect(201);

  // KAO STO SAM TI REKAO RANIJE, A SADA TE PODSECAM
  // GORNJI UPDATING BI TREBAO DA POZOVE I FUNKCIJU
  // ZA KOJU CEMO MI DA NAPRAVIM SLDECE ASSERTION O TOME DA LI JE ONA POZVANA

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // NAPRAVICU I NEKE ASSERTIONE O TOME KOLIKO JE PUTA
  // BILA CALLED
  
  // ZAPAMTI, POSTO JE OVO JEDAN TEST
  // A JA SAM KREIRAO TICKET, CIME SAM HITT-OVAO `new.ts`
  // I ONAJ RESET NIJE MOGAO DA SE DOGODI, JER JE REC O JEDNOM TESTU 
  // (A RESET MOCK FUNKCIJE *(RESET mockImplementation) SE DOGADJA
  // IZMEDJU TESTOVA)

  // ZATO JE BROJ INVOKACIJA USTVARI 2

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
  // TAKO DA BI BROJ POIVA TREBAL ODA BUDE 2
});


```

RUN-OVAO SAM TEST

- `cd tickets`

- `yarn test`

I ZANIMA ME SAMO TESTS `update.test.ts`, PA PRITISKAM `p`, PA PRITISKAM ENTER, KUCAM update, PRITISKAM ENTER

I ZAISTA SVI TESTOVI SU PROSLI


