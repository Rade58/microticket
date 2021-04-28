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


