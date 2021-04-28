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

**ALI OVOG PUTA CEMO A RUNN-UJEMO TESTS SAMO ZA SPECIFIC FILE**

TO CE BITI `new.test.ts`

- `yarn test`

PA POSTO JE NAS TEST U WATCH MODE-U (NA DNU TESTOVA CE TI BITI PRIKAZANE ODREDJENE OPCIJE)

NAS ZANIMA `Press p to filter by a filename regex pattern.`

KUCAMO DAKLE `p`

ONDA SM OPROMPTED DA KUCAMO

JA SAM KUCAO `new` JER TE KARAKTERE IMAM U IMENU FILE

PRITISLKAM ENTER. **I TESTOVI CE SAMO RUNN-OVATI ZA `new.test.ts`**

EVO TI SADA DA VIDIS KAKAV TI JE ERROR MESSAGE (**TO JE ONAJ ERROR MESAGE KOJ ISI DEFINISAO DA SE STAMPA IZ ERROR HANDLING MIDDLEWARE**)

```zsh
console.error
    TypeError: Cannot read property 'publish' of undefined

```

**DOBRO, SADA ZNAMO DA JE MOCK USPESNO KORISCEN, JER NEMAMO ERROR KOJI GOVORI DA NAM NATS CLIENT NIJE CONNECTED, `A GORNJI ERROR JE TU JER NISMO JOS IMPLEMENTIRALI NISTA U MOCK FILE-U`**

JER JE POTREBNO DA IZVOZIMO INSTANCU, KOJA IMA `client` GETTER-A

A TAJ GETTER TREBA DA VRACA INITIALIZED (CONNECTED) NATS CLIENT-A 

# WRITING IMPLEMENTATION FOR THE MOCK

RANIJE SAM SAM OIZ MOCK FILE-A RETURN-OVAO OBJEKAT, KOJI JE EMPTY

SADA TREBA DA NAPISEMO IMPLEMENTACIJ U DA TAJ OBJEKAT IMA ONO STO IMA I REAL OBJECT, KOJI SE IZVOZI IS NORMAL FILE-A

**DA BISMO NAPISALI FAKE IMPLEMMENTATION, MORAMO DOBRO POGLEDATI FILE ZA KOJI PISEMO MOCK**

OVO JE REAL FILE

- `cat tickets/src/events/nats-wrapper.ts`

ZANIMA NAS I STA DONJA KLASA USTVARI RADI

ZANIMA NAS DAKLE STA MOZE IMATI NA SEBI INSTANCC KOJU IZVOZIMO IZ TOG FILE-A

**TACNIJE ZANIMAJU NAS SMO ONI PART-OVI KOJI SU NEOPHODNI DA TEST PRODJE**

```ts
import { Stan, connect, ClientOpts } from "node-nats-streaming";

class NatsWrapper {
  /**
   * @description CAN BE UNDEFINED BECAUSE IT IS GOING TO BE INITIALIZED
   * FROM METHOD OF THE NatsWrapper CLASS ("connect" METHOD)
   */
  private _client?: Stan;

  /**
   *
   * @param clusterId cluster id (specifi) (you can find it in nats-depl.yaml) (you setted it as `"-cid"`)
   * @param clientId make up one
   * @param clientOpts ClientOpts (but you are interested in "url" filed only)
   */
  connect(clusterId: string, clientId: string, clientOpts: ClientOpts) {
    this._client = connect(clusterId, clientId, clientOpts);

    const _client = this._client;

    return new Promise<void>((res, rej) => {
      _client.on("connect", () => {
        console.log(`
          Connected to Nats Streaming Server
          clientId: ${clientId}
        `);

        res();
      });

      _client.on("error", () => {
        console.log(
          `client ${clientId} Failed to connect to Nats Streaming Server`
        );

        rej();
      });
    });
  }

  /**
   * NATS client GETTER
   */
  get client(): Stan {
    if (!this._client) {
      throw new Error("Can't access NATS Streaming Server before connecting.");
    }

    return this._client;
  }
}

export const natsWrapper = new NatsWrapper();
```

MI GORNJU INSTACU, TACNIJE SAMO `_client` (KOJI JE PRIVATE, I ZATO IMAMO GETTER-A), `KORISTIMO KAD INSTATICIZIRAMO NASEG CUSTOM PUBLISHER-A` SA KOJIM SALJEMO EVENT 

EVO INSTANCA KOJA TREBA DA BUDE RETURNED, TREBA DA BUDE OVAKVA

```ts
{
  _client: Stan;
  client: Stan;
  connect: () => Promise;
}
```

**MI MORAMO VIDETI STA SAM HANDLER (JER SE ONI TESTIRAJU) UZIMA TREBA SA GORNJEG OBJEKATA, ODNOSNO STA JE TO ONO STO SE KORISTI U HANDLERU, A PRIPADA U NORMALNIM USLOVIMA ONOM FILE-U, ZA KOJI TREBA DA PISEMO MOCK**

PA VEC SAM TI REKAO, TO JE SAMO `client`

ZATO MI IZ MOCK FILE-A MORAMO IZVESTI OBJEKAT, KOJ ICE IMATI SAMO client PROPERTI, CIA CE VREDNOST BITI `Stan` INSTANCA, ODNOSNO NATS CLIENT

- `code tickets/src/events/__mocks__/nats-wrapper.ts`

```ts
export const natsWrapper = {
  client: ""  
};

```

**ALI MI MORAMO DA RAZMISLJAMO SADA NA KOJI NACIN PARCE CODE-A, KOJEJE U HANDLLERU, USTVARI KORISTI, UPRAVO POMENUTOG CLIENTA**

DAKLE TREBA DA VIDIMO I NASU CUSTOM PUBLISHER KLASU

ALI NECEMO MNOGO OTKRITI IZ TOGA

- `cat tickets/src/events/publishers/ticket-created-publisher.ts`

```ts
import { Stan } from "node-nats-streaming";

import {
  Publisher,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEventI> {
  public channelName: CNE.ticket_created;

  constructor(stan: Stan) {
    super(stan);

    this.channelName = CNE.ticket_created;

    Object.setPrototypeOf(this, TicketCreatedPublisher.prototype);
  }
}
```

NISMO MNOGO OTKRILI JE ONO STO KORISTI CLIENTA, UPRAVO `publish` FUNKCIJA, CIJU IMPLEMENTACIJU SMO NAPISALI U ABTRAKT KLASI, KOJA JE DAO NASEG COMMON PAKETA

MOZEMO TU ABSTRKATNU KLASU, GORE KADA KLIKNEMO SA `Ctrl + Alt + Click` NA `Publisher` ABSTRACT KLASU, ALI NI TU NECEMO MOCI MNOGO STOSTA DA VIDIMO, JER CE NAM BITI OTVORED CODE TYPESCRIPT DECLARATION FILE-A

ZATOCEMO POGLEDATI FILE, TMO GDE SMO GA KREIRALI, A TO JE common MODULE

- `cat common/src/events/abstr/abstr-publisher.ts`

```ts
import { Stan } from "node-nats-streaming";
import { ChannelNamesEnum as CNE } from "../channel-names";

interface EventI {
  channelName: CNE;
  data: any;
}

// ONO STO NAS ZANIMA JE `publish` METODA SLEDECE KLASE
// POGLEDAJ NJEN CODE
// NALAZO SE NA DNU KLASE

export abstract class Publisher<T extends EventI> {
  /**
   * @description NAME OF THE CHANNEL YOU ARE PUBLISHING TO
   */
  abstract channelName: T["channelName"];

  /**
   * @description OVO TREBA DA JE PRE INITIALLIZED, STAN CLIENT (STO ZNACI DA BISMO VEC TREBAL IDA BUDEMO
   * CONNECCTED TO NATS STREAMING SERVER) (DOBIJENO SA nats.connect)
   */
  private stanClient: Stan;

  constructor(stanClient: Stan) {
    this.stanClient = stanClient;

    Object.setPrototypeOf(this, Publisher.prototype);
  }

  // EVO U PITANJU JE OVA METODA

  /**
   *
   * @param data To be published
   * @returns Promise<any>
   */
  publish(data: T["data"]) {
    const jsonData = JSON.stringify(data);
    const stan = this.stanClient;
    const channelName = this.channelName;

    return new Promise<void>((res, rej) => {
      stan.publish(
        channelName,
        jsonData,
        /**
         *
         * @param error Error | undefined
         */
        (error) => {
          if (error) {
            return rej(error);
          }

          console.log(`
            Event Published
            Channel: ${this.channelName}
          `);

          res();
        }
      );
    });
  }
}

```

IZ SVEGA STO SAM VIDEO MOGU ZAKLJUCITI STA MOJ MOCK TREBA DA IMA

ON USTVARI TREBA BITI OVAKAV:

```ts
{
  client: {
    publish (data: any) => Promise<void>
  }

}
```

**ALI BITNA JE I SAMA publish METODA I CINJENICA DA SE TAMO PRIMENJUJE JEDNA DRUGA `publish` METODA, KOJA JE METODA STAN VLIENTA, JER KAO STO VIDIS GORE USTVARIR SE POZIVA `this._client.publish`**

NJOJ SE KA OARGUMENTI DODAJU `channelName`, ZATIM `DATA KOJI SE PUBLISH-UJE`, I ZADAJE SE `CALLBACK` KOJI SE IZVRSAVA , BILO DA JE PUBLISHING USPEO ILI NIJE
