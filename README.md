# common MODULE UPDATING

DAKLE TREBA DA KOPIRAM SVU OVU LOGIKU OKO PUBLISHINGA I LISTENINGA EVENTOVA, IZ `nats_test_project` U `common` MODUL, KOJI CEMO ONDA REBUILD-OVATI I REPUBLISHOVATI GA NA [NPM](https://www.npmjs.com/package/@ramicktick/common)

ZATIM MORAMO REINSTALIRATI, POMENUTI MODUL U tickets MICROSERVICE-U, KAKO BISMO MOGLI KORISTITI NATS STREAMING SERVER LOGIKU

- `mkdir common/src/events`

NECU SVE KOPIRATI

KOPIRO SAM ABSTRAKTNE KLASE, ZATIM ENUM KOJIM SE TYPE-UJU CHANNEL NAME, ALI I INTERFACE, KOJI TYPE-UJE EVENT, TO JE ONAJ INTERFACE, KOJI SE KORISTI

`nats_test_project/src/events/abstr-listener.ts`
`nats_test_project/src/events/abstr-publisher.ts`
`nats_test_project/src/events/channel-names.ts`
`nats_test_project/src/events/ticket-created-event.ts`

NISAM KOPIRAO KLASE, KOJE SU KORISTILE ABSTRAKTNU DA BI SE NAPRAVIO CUSTOM PUBLISHER I LISTENER CLASS

SADA DAKLE IMAM OVO U MOM common MODULU

`common/src/abstr-listener.ts`
`common/src/abstr-publisher.ts`
`common/src/channel-names.ts`
`common/src/events/ticket-created-event.ts`

***

digresija:

**ETO OVDE JE AUTOR WORKSHOPA POKAZO KONTRADIKCIJU** (A MOZDA GA NISI DOBRO RAZUMEO)

**JER JE RANIJE REKAO DA CE SVE KLASE PUBLISHERA I LISTENERA BITI DEFINED ON MODUL LEVEL**

**A SADA KAZE DRUGACIJE, KAZE DA CE SE SVAKA KLASA PRAVITI NA LEVELU SAMOG MICROSERVICE-A**

RANIJE JE REKAO DA JE TO PREVISE KOPLEKSNO ZA ENGINEERA KOJI RADI NA JEDNOM MICROSERVICE-U; REKAO JE DA ONI, USTVARI NE TREBAJU EXTEND-UJU ABSTRACT CLASS

***

# S OBZIROM DA ZNAM DA CE SE ABTRACT `Listener` I `Publisher` KLASE EKSTENDOVATI NA NIVOU MICROSERVICE-A, NAMRVICU ODREDJENE IZMENE U NJIMA

POD JEDAN:

ENUM SVIH MOGUCIH CHANNEL NAME-OVA CE BITI DEO LIBRARY-JA

STO ZNACI DA CES SVAKI PUT KADA SE ODLUCIS DA DEFINISES NOVI EVENT, DA CES MORATI UPDATE-OVATI LAIBRARY, KAKO BO U ENUM DODAO NOVI UNOS

**A ZA SVAK NOVI EVENT, KOJI BUDES ZELEO DA DODAS, DODAVACES INTERFACE, KOJI KORISTIS KAO GENERIC KADA EXTEND-UJES ABSTRACT CLASS**

PREMA TOME MOZES MALO BOLJE DA TYPE-UJES ABSTRACT CLASSES; ODNOSNO DA **channelName U SAMOJ ABTRACT KLASI TYPE-UJES SA ENUMOM**

- `code common/src/events/abstr-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";
// UVEZAO OVO
import { ChannelNamesEnum as CNE } from "./channel-names";

interface EventI {
  // I UMESTO OVOGA
  // channelName: any;
  // STAVIO OVO
  channelName: CNE;
  //
  data: any;
}

// DALJE SVE OSTAJE ISTO, NISTA NECU DIRATI

export abstract class Listener<T extends EventI> {
  /**
   * @description OVO TREBA DA JE PRE INITIALLIZED, STAN CLIENT (STO ZNACI DA BISMO VEC TREBAL IDA BUDEMO
   * CONNECCTED TO NATS STREAMING SERVER) (DOBIJENO SA nats.connect)
   */
  private stanClient: Stan;

  /**
   *
   * @description ime kanala, a mogao sam ga umesto channelName nzvati
   * i subject, ali izbrao sa mda se zove kako se zove
   * TO TI JE ONO STO JE U FORMATU    ticket:created   NA PRIMER
   */
  abstract channelName: T["channelName"];

  /**
   * @description SLUZI DA SE POSTIGNE UKLANJANJE EVENTA KOJI JE PROOCESSED
   */
  abstract queueGroupName: string;

  /**
   * @description
   * @param parsedData any
   * @param msg nats.Message
   */
  abstract onMessage(parsedData: T["data"], msg: Message): void;

  /**
   * @description BROJ MILI SEKUNDI NAKON KOJIH CE STREAMING SERVER PRESTATI
   * DA SALJE NON PROCESSED EVENT
   */
  protected ackWait: number = 5 * 1000;

  constructor(stanClient: Stan) {
    this.stanClient = stanClient;

    Object.setPrototypeOf(this, Listener.prototype);
  }

  /**
   *
   * @description Sets subscription options
   */
  subscriptionOptions() {
    return (
      this.stanClient
        .subscriptionOptions()
        /**
         * @description ako je listener down na duze bice mu poslati zaostali events
         */
        .setDeliverAllAvailable()
        /**
         * @description ali mu nece biti poslati already processed events
         * dali smo isti name kao queued group name
         */
        .setDurableName(this.queueGroupName)
        /**
         * @description morace se pozivati msg.ack da se potvrdi u listneru da je event processed
         * sto se naravno govori nats streaming serveru da ne bi slao processed event opet
         */
        .setManualAckMode(true)
        /**
         * @description na acknoledgment ce se nats streaming server cekati
         * specificirani broj milisekundi
         */
        .setAckWait(this.ackWait)
    );
  }

  /**
   * @description SETTING UP SUBSCRIPTION
   */
  listen() {
    const subscription = this.stanClient.subscribe(
      this.channelName,
      this.queueGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(
        `Mesage received:
          subject: ${this.channelName}
          queueGroup: ${this.queueGroupName}
        `
      );

      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  /**
   * @description parsed message
   * @param msg nats.Message
   */
  parseMessage(msg: Message) {
    const data = msg.getData();

    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf-8"));
  }
}

```

- `code common/src/events/abstr-publisher.ts`

```ts
import { Stan } from "node-nats-streaming";
// UVOZIM OVO
import { ChannelNamesEnum as CNE } from "./channel-names";

interface EventI {
  // UMESTO OVOGA
  // channelName: any;
  // OVO
  channelName: CNE;
  //
  data: any;
}

// DALJE NISTA NECU MENJATI

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

# SADA IDI PO NOVIM FILE-OVIMA I GLEDAJ STA TI NIJE INSTALIRANO OD DEPENDANCIES-A PA TO INSTALIRAJ

- `cd common`

- `npm i node-nats-streaming`

SADA JE SVE OK

# SADA ZELIM DA DODAM JOS CHANNEL NAME-OVA KOJE CU KORISTITI ZA MOJ OVERALL PROJEKAT, A ZELIM DA DODAM I PAR NOVIH INTERFACE-OVA ZA EVENTOVE

TREBA CE MI I "ticket:updated", TAKO DA CU I TO DA DODAM

- `code common/src/events/channel-names.ts`

```ts
/**
 * @description Channel Names Enum   (ALSO KNOWN AS SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  // DODAO SAM OVO
  ticket_updated = "ticket:updated",
}

```

**SADA CU DA NAPRAVIM TYPE ZA EVENT, GDE RADIM ONAJ TYPE COUPLING, GDE COUPLE-UJEM CHANNEL NAME SA EVENT DATA-OM**

- `touch common/src/events/ticket-updated-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "./channel-names";

export interface TicketUpdatedEventI {
  channelName: CNE.ticket_updated;
  data: {
    id: string;
    title: string;
    price: number;
    // BICE OVDE JOS INFORMACIJA, PREDPOSTAVLJAM ZA
    // VESRION (KOJI BI SE TICAO RESAVANJA CONCURRENCY PROBLEMA),
    //  ALI CU TO TEK KASNIJE DODAVATI
    // MEDJUTIM TREBALO BI DA ZADAM I userId
    userId: string;
  };
}
```

DODAJ I userId FIELD I U `common/src/events/ticket-created-event.ts`

# ISTO TAKO MENI SE NE SVIDJA FOLDER STRUKTURA UOPSTE

TREBALO BI DA ZADAM FOLDER U KOJEM CU DEFINISATI EVENT INTERFACES, ISTO TAKO FOLDER ZA ABSTRACT KLASE

MISLIM DA JE LAKSE TAKO

- `mkdir common/src/events/abstr`

U POMENUTI FOLDER STAVITI ABSTRACT KLASE

TAKO DA SADA IMAM

`common/src/events/abstr/abstr-listener.ts` I `common/src/events/abstr/abstr-publisher.ts`

- `mkdir common/src/events/event-interfaces`

U POMENUTI FOLDER CU STAVITI, SVE EVENT INTERFACE-OVE

TAKO DA SADA TAMO IMAM `common/src/events/event-interfaces/ticket-created-event.ts` I `common/src/events/event-interfaces/ticket-updated-event.ts`

# SADA CEMO DA IZVEZEMO ABSTRACT KLASE, I IZVESCEMO I EVET INTERFACES IZ NASEG MODULA, ALI IZVESCEMO I CHANNEL NAMES ENUM 

- `code common/src/index.ts`

```ts
export * from "./errors/bad-request-error";
export * from "./errors/custom-error";
export * from "./errors/database-connection-error";
export * from "./errors/not-authorized-error";
export * from "./errors/not-found-error";
export * from "./errors/request-validation-error";
export * from "./middlewares/current-user";
export * from "./middlewares/error-handler";
export * from "./middlewares/require-auth";
export * from "./middlewares/validate-request";

// IZVOZIM OVE
export * from "./events/abstr/abstr-listener";
export * from "./events/abstr/abstr-publisher";
export * from "./events/channel-names";
export * from "./events/event-interfaces/ticket-created-event";
export * from "./events/event-interfaces/ticket-updated-event";

```

# SADA CEMO DA REBUILD-UJEMO, I REPUBLISH-UJEMO NAS PACKAGE

ON CE TAKO DOBITI I NOVU VERZIJU

- `cd common`

- `npm run pub` (SAM SE PODSETI SE STA SVE OVAJ SCCRIPT RADI)

# SADA MOZEMO DA UPDATE-UJEMO VERZIJI, ODNOSNO DA REINSTALIRAMO, NAS COMMON MODULE, U TRENITNO JEDINOM MICROSERVICE-U, KOJI GA KORISTI

- `cd tickets`

- `yarn add @ramicktick/common --latest`
