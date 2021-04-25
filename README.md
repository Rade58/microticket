# TYPING EVENT DATA WITH TYPESCRIPT; TYPING CHANNEL NAMES WITH TYPESCRIPT

***
***

digresija:

OVO JE MOGUCE URADITI

```ts
interface foo {bar: "stavros"}

const baz: foo['bar'] = "stavros"
```

***
***

IDEJA JE DA TYPE-UJES KLASU KOJA EXTENDUJE ABSTRACTNU KLASU Listener

ALI IDEJA JE DA TYPE-UJES CHANNEL NAME (ILI KAKO GA JOS NAZIVAJU subject)

**ALI JOS VAZNIJE TYPE-OVANJE SUBJETA TREB ODMA DA TYPE-UJE KAKVA DATA, KOJI TI JE DOSTUPAN U `onMessage` METODI KLASE, A TO JE DATA KOJ IJE DOSAO SA EVENTOM**

# KREIRCU SADA ENUM U KOJEM CU DRZATI SVE MOGUCE SUBJECTS (CHANNEL NAMES)

- `touch nats_test_project/src/events/channel-names.ts`

```ts
/**
 * @description Channel Names Enum   (SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  // DODAO SAM I OVAJ SUBJECT, NARAVNO
  // JOS NIJE BITAN, ALI CE TI POSTATI BITAN KASNIJE
  // LADA BUDES NASTAVIO SA DEVELOPMENTOM TVOG MAIN PROJECT-A
  order_updated = "order:updated",
}

// NARAVNO KADA GOD BUDES ZELEO DA KORISTIS NOVI CHNNEL IDEJ JE 
// DA SE OVDE VRATIOS OVO UPDATE-UJES

```

# ENUM TYPE COUPLING WITH DATA INTERFACE

- `touch nats_test_project/src/events/ticket-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "./channel-names";

export interface TicketCreatedEventI {
  channelName: CNE.ticket_created;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
```

**OVO GORE JE NARAVNO NESTO STO CU RADITI KADA GOD ZATREBAM DA TYPE-UJEM NEKI NOVI CHANNEL NAME, I DATA RELATED TO EVENT, KOJI CE NATS STREAMING SERVER SLATI IZ TOG KANALA**

# DEFINISANJE GENERIC TYPE-A, U ABSTRACT Listener KLASI, KOJIM SE TYPE-UJU CHANNEL NAME I PROCESSED DATA INSIDE `onMessage`

JA CU USTVARI DEFINISATI GENERIC TYPE, ALI CE TAJ GENERIC TYPE EXTEND-OVATI JEDAN INTERFACE

- `code nats_test_project/src/events/abstr-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";

// ***** OVO SAM DODAO
// GRADIS OVAJ INTERFACE U KOJEM SU TI SAMO BITNI FIELD-OVI
// ALI NE I NJIHOVI TYPE-OVI
interface EventI {
  channelName: any;
  data: any;
}

// NAPRAVICU GENERIC KOJI EXTEND-UJE GORNJI INTERFACE

export abstract class Listener<T extends EventI> {
  // KORISTICU FIELD-OVE GENERICA DA TYPE-UJEM channelName PROPERTI
  // I parsedData PARAMETAR onMessage METODE

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

# SADA KADA KRIRAS NOVU LISTNER KASU KOJA EXTEND-UJE GORNJI ABSTRACT KLAS, MORACES DA PROSLEDIS I GENERIC

EVO TO CU POPRAVITI KOD MOJE `TicketsCreatedListener` KLASE

A I SAM ZNAS KOJI CES INTERFACE PROSLEDITI ZA GENERIC

- `nats_test_project/src/events/tickets-created-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";
import { Listener } from "./abstr-listener";
// UVOZIM INTERFACE, KOJI TYPE-UJE channelName I data
// KAKO BI GA KORISTIO KAO GENERIC ZA Listener ABSTRACT KLASU
// KADA IZ NE EXTEND-UJEM

import { TicketCreatedEventI } from "./ticket-created-event";

// ALI MORACU DA UVEZEM I ENUM JER SAMO S NJIM MOGU ZADATI
// KOJI CE TO TYPE IMATI channelName
import { ChannelNamesEnum as CNE } from "./channel-names";

// PROSLEDIO SAM GA KO GENERIC
export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  // PREM TOME OVO NE VALJA
  // public channelName: string;
  // MORA OVAKO
  public channelName: CNE.ticket_created;
  // IAKO OVO OVKO IZGLEDA CUDNO TI SI OVO OVAKO MORAO URADITI
  // JER JE channelName BIO ABSTRACT FIELD Listener KLASE
  // STO ZNACI DA GA OVDE IZNAD MORAS TYPE-OVATI
  // A U KONSTRUKTORU GA MORAS INICIJALIZOVATI
  // JEDINO TAKO TYPESCRIPT NECE VIKTI NA TEBE

  public queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    // DAKLE OVO NE VALJA
    // this.channelName = "ticket:created";
    // MORA OVAKO
    this.channelName = CNE.ticket_created;
    //

    this.queueGroupName = "payments-service";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  // ALI NI OVDE parsedData NIJE TYPED
  // ODNOSNO TI MOZES STAVITI I any TYPE A TYPESCRIPT NECE YELL-OVATI NA TEBE
  // ALI TO JE SAMO U SLUCAJU SA any (TI SHVATI ZASTO KAD VIDIS STA EXTEND-UJE GENERIC I ABSTRACT KLASE)
  // NE ZNAM ZASTO JE TO TAKO, ALI SAM, RUCNO TYPE-OVAO
  // parsedData
  // OVO JE VISE SLUZILO DA SE POGRESAN TYPING NE DOZVOLI
  // BITNO JE RECI DA BI TYPESCRIPT YELL-OVAO NA MENE DA
  // SAM DOLE STAVIO POGRESNE TYPE-OVE ZA ARGUMENTR
  // parsedData SME BITI any TAKODJE ,ALI msg SAM OSME BITI msg
  // NIJE DA CU IKADA KORISTITI any, LAI GOVORIM TI STA JE
  // RELEVANTNO

  onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    console.log("Event data!", parsedData);
    msg.ack();

    // SADA KADA ZELIS DA RADIS NESTO SA DATA, KUUCANJEM
    // parsedData.      IZLISTACE TI SE MOGUCI FIELD-OVI
  }
}
```

# MOGLI BISMO DA REKAPITULIRAMO KAKO TECE PROCES PRAVLJENJA LISTENER-A

PA PRVO SE NAPRAVE TYPE-OVI

U ENUM (`nats_test_project/src/events/channel-names.ts`) SE DODADA DODATNI UNOS, ODNOSNO DODATNI CHANNEL NAME

ONDA RAZMOTRIMO, KAKAV CEMO MI TO DATA DOBITI SA EVENTOM

PA ONDA DEFINISMO INTERFACE (PRVAIMO NOVI FILE, KOJI CE IZGLEDATI POPUT `nats_test_project/src/events/ticket-created-event.ts` FILE-A) KOJI IMA DVA FIELD-A, `channelName`, KOJI JE TYPE, NEKOG OD PROPA ENUM-A, I `data` INTERFACE, KOJI MTYPE-UJEM ODATA KOJI CE DOCI SA EVENTOM

**ONDA MOZEMO DA PRAVIMO NOVOG LISTENERA, KOJI EXTEND-UJE IZ ABSTRACT Listener-A, KOJEM DODAJEMO GENERIC, A TAJ GENERIC JE INTERFACE KOJI SAM POMENUO IZNAD**

DALJE KADA NAPRAVIS NOVU KLASU, KAKAVA JE I TVOJA: `nats_test_project/src/events/tickets-created-listener.ts` KLASA

I ONDA JE UPOTREBIS, NA NACIN, KAKO SMO JE UPOTREBILI U `nats_test_project/src/listener.ts`

DAKLE TREBAS DA KONEKTUJES NOVOG nats CLIENT-A, ZATIM U ON 'connect' HANDLERU MOZES DA POZOVES KLASINU listn METODU, CIME CES DEFINISATI SUBSCRIPTION

# ALI STO SE TICE ONOGA STO CEMO STAVITI U NAS LIBRARY, SIGURNO CES SE IZNENADITI

MI NECEMO SAMO ABSTRACT KLASU DEFINISATI KAO DEO LIBRARY-JA

SIGURNO SI MISLIO DA CES SVAKI CAS, TI ILI NEKI DRUGI ENGINEER DA EXTEND-UJETE `Listener` ABSTRACT CLASS

**CILJE JE DA MI NAPRAVIMO SVE POTREBNE KLASE KOJE EXTEND-UJU ABSTRACT Listener; I DA, TO STAVIMO U NAS `@ramicktick/common` LIBRARY**

ONDA ONAJ KO INSTALIRA NAS PAKET U MICROSERVICEIMA, MOZE ODMAH KORITITI, POMENUTE KLASE U MICROSRVICE-OVIMA, BEZ DA RAZMISLJAJU O EXTENDIINGU ABSTRACT KLASE I SVOJ TOJ KOMPLEKSNOSTI
