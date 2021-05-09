# REAKO SAM TI U PROSLOM BRANCHU, DA SAM NAPRAVIO VELIKI PREVID, KADA SAM DEFINISAO CODE `onMessage` FUNKCIJE LISTENER-A; NAIME, JA SAM TADA UPDATE-OVAO DOKUMENTE IZ `Tickets` KOLEKCIJE, `tickets` MICROSERVICE-A, A TADA NISAM OBZANANI DRUGIM MICROSERVICE-OVIMA DA JE `Ticket` UPDATED

DAKLE JA NISAM PUBLISH-OVAO `"ticket:updated"`

DAKLE `orders` MICROSERVICE, KOJI JE ZA SADA JEDINI SUBSCRIBED NA `"ticket:updated"` CHANNEL, BIO BI U VELIKOM PROBLEMU, JER NE BI DOBIO EVENT, JER NIJE NI PUBLISHED

DAKLE JASNO TI JE KAKVI BI SVE PROBLEMI NASTALI KADA TVOJ `tickets` MICROSERVICE, UPDATE-UJE TICKET, I TIME I INCRMENTIRA `version` FIELD NA TICKET-U; **A DA ZA TO NE ZNAJU DRUGI MICROSERVICE-I, KOJI U SVOJIM DATABASE-OVIMA, IMAJU REPLICATED `Tickets` KOLEKCIJU**

**SADA CU TO DA POPRAVIM, TAKO STO CU PUBLISH-OVATI EVENT TO "`ticket:updated`" CHANNEL**

NARAVNO POSLE TOGA MOGU PROSIRITI I TESTOVE, U KOJIMA BI TESTIRAO DA LI SE PUBLISH-OVAO EVENT KAKO TREBA

## MEDJUTIM, POSTO SMO U UPOTREBU UVELI NOVI FIELD, KOJI SE ZOVE `orderId`, MI MORAMO UPDATE-OVATI TYPESCRIPT TYPE-OVE, KOJ ISU TIED TO PUBLISHERS, KAOKO BI I TAMO BIO TYPED TAJ FIELD; A TO ZNACI DA CEMO MORATI MODIFIKOVATI NAS COMMON MODULE

DAKLE REDEFINISACEMO NAS common MODULE, PA CEMO G REPUBISH-OVATI

A ONO GDE TYPE-UJEMO NOVI FIELD, JESTE SLEDECI FILE

- `code common/src/events/event-interfaces/ticket-updated-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface TicketUpdatedEventI {
  channelName: CNE.ticket_updated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    // DODAO OVO
    orderId?: string;
    //
  };
}

```

- `cd common`

- `npm run pub`

## SADA MOZES DA UPDATE-UJES TVOJ COMMON MODULE, U `tickets` MICROSERVICE-U

- `cd tickets`

- `yarn add @ramicktick/common --latest`

ALU URADICU OVO I ZA orders ,PROSTO JER ZELIM DA I TAMO BUDE LATEST VERSION

- `cd orders`

- `yarn add @ramicktick/common --latest`

## MEDJUTIM TREBLI BI I DA REDEFINISEMO MODELE ZA REPLICATED Tickets KOLEKCIJU; A NJU TRENUTN OSAMO IMAMO U `orders` MICROSERVICE-U

- `code orders/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

import { Order } from "./order.model";

// EVO KAO STO VIDIS SAMO SAM NA SCHEMA-I DOAO NOVI FIELD
// OSTALO NISTA NISAM DIRAO

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    // EVO GA
    orderId: {
      type: String,
      // I NARAVNO NIJE REQUIRED
    },
  },
  {
    toJSON: {
      /**
       * @param ret object to be returned later as json
       */
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },

    optimisticConcurrency: true,

    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  version: number;
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for things, among others I can search on obtained document
 */
export interface TicketDocumentI extends Document, TicketFields {
  isReserved: () => Promise<boolean>; // PROMISE JER CE METODA BITI DEFINISANA KAO async
}

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // EVO OVO JE TA METODA
  findOneByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDocumentI | null>;
}

/**
 *
 * @param event you can pass allparsedData
 * @returns Promise<TicketDocumentI | null>
 */
ticketSchema.statics.findOneByEvent = async function (event: {
  id: string;
  version: number;
}) {
  const { id, version } = event;

  const ticket = await this.findOne({ _id: id, version: version - 1 });

  return ticket;
};

/**
 *
 * @description method on the document, to check if status is not cancelled, or that order doesn't exist
 * @returns boolean
 */
ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const ticketId = this.id;

  const order = await Order.findOne({
    ticket: ticketId,
    status: {
      $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
    },
  });

  if (order) {
    return true;
  }

  return false;
};

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };

```

KADA SAM SVE TO URAIO MOGU SE POSVETITI PUBLISHINGU EVENTA

ALI NE TAKO BRZO JER ZELIM DA NAPRAVIM JOS JEDNU IZMENU U NASEM COMMON MODULE-U

## DA BI INSTATICIZIRALI PUBLISHERA, NAMA TREBA `natsWrapper`, ODNOSNO NATS CLIENT; MEDJUTIM NEZGODNO MI JE DA UVOZIM `natsWrapper` U FAJL, U KOJM MI DEFINISEMO CLASS ZA CUSTOM PUBLISHER-A

TESTING BI BIO CHALLENGING KADA BI TO URADILI

IAKO JE PONEKAD TO STVARNO NEIZBEZNO DA SE URADI, MI NECEMO SADA UVOZITI NESTO POPUT natsClient-A

**DAKLE JA MORAM PONOVO MODIFIKOVATI MOJ common MODULE**

TACNIJE, DODACU NOVI FIELD NA `Listener` KLASI, A TO CE BITI `stanClient` (**ALI NECE BITI POTREBE DA DOJAM NOVI FIELD JER JE VEC DEFINISAN, MEDJUTIM ON JE TRENUTNO `private`**)

ALI JA CU DEFINISATI DA ON BUDE `protected`; **STO ZNACI DA CE SE MOCI KORISTITI SAMO WHITHIN EXTENDING CLASS, ALI NE I NA INSTANCAMA EXTENDING CLASS-E**, A TO NAM TACNO I TREBA

- `code common/src/events/abstr/abstr-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";
import { ChannelNamesEnum as CNE } from "../channel-names";

interface EventI {
  channelName: CNE;
  data: any;
}

// DAKLE SAMO CU UCINITI DA stnClient VVISE NE BUDE private
// VEC protected FIELD

export abstract class Listener<T extends EventI> {
  /**
   * @description OVO TREBA DA JE PRE INITIALLIZED, STAN CLIENT (STO ZNACI DA BISMO VEC TREBAL IDA BUDEMO
   * CONNECCTED TO NATS STREAMING SERVER) (DOBIJENO SA nats.connect)
   */
  // UMSTO OVOGA
  // private stanClient: Stan;
  // ZADAJEM OVAKO
  protected stanClient: Stan;

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

SAMO DA KAZEM DA SAM JA OVO GORE URADIO I ZA ABSTRACT `Publisher` (BECAUSE WHY NOT, MOZDA CE POSTOJATI SCENARIO KADA CE TO TREBATI,, ALI ZA SADA NE TREBA)

**I PONOVO CEMO DA REPUBLISH-UJEMO common MODULE**

- `cd common`

- `npm run pub`

**I OPET CEMO DA INSTALIRAMO FRESHEST VERZIJU, TAMO GDE GA KORISTIMO**

- `cd orders`

- `yarn add @ramicktick/common --latest`

- `cd tickets`

- `yarn add @ramicktick/common --latest`

SADA KONACNO MOZES DEFINISATI PUBLISHING

# SADA CEMO DEFINISATI PUBLISHING EVENT-A FROM `onMessage` METHOD OF `OrderCreatedListener` CLASS

- `code tickets/src/events/listeners/order-created-listener.ts`

```ts
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
import { Ticket } from "../../models/ticket.model";
// SADA CU UVESTI I       TicketUpdatedPublisher
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
// ALI NAM TREBA I NATS CLIENT
// MEDJUTIM ,NECEMO GA KORISTITI SA natsWrapper-A
// JER client POSTOJI NA INSTANCI SLEDECE KLASE, KAO protected FIELD
// JER TAKO SMO DEFINISALI KROZ Listener ABSTRACT CLASS-U

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;

  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_created;
    this.queueGroupName = tickets_microservice;

    Object.setPrototypeOf(this, OrderCreatedListener.prototype);
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    const { id: orderId, ticket: ticketData } = parsedData;

    const { id: ticketId } = ticketData;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    if (ticket.orderId) {
      throw new Error("ticket already reserved");
    }

    ticket.set({ orderId });

    await ticket.save();

    // DAKLE RANIJE, NISI MOGAO UZETI stanClent SA this
    // A SADA MOZES JER SAM JA DEFINISAO U ABSTRACT Listener-U
    // DA JE TAJ FIELD protected
    // ALI KAKO SAM REKAO, TO TAKODJE ZNACI DA INSTACA CUSTOM LISTENERA
    // NE MOZE KORISTITI POMENUTI FIELD, DOK EXTENDING CLASS MOZE

    // ISTO TAKO VAZNO JE PODSETITI SE DA JE GORNJIM ticket.save()
    // POZIVOM OSIGURANO DA JE version INCRMENTED BY ONE

    // ISTO TAKO NE MORAS DA REFETCH-UJES TICKET IZ DATBASE-A
    // JER GORNJIM save POZIVOM TI SI OBEZBEDIO PROMENE NA TICKETU
    // ONE CE BITI PRISUTNE NA ticketu NA KOJEM SI POZVAO save

    await new TicketUpdatedPublisher(this.stanClient).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
```

# SADA CEMO DEFINISATI PUBLISHING EVENT-A FROM `onMessage` METHOD OF `OrderCancelledListener` CLASS

- `code tickets/src/events/listeners/order-cancelled-listener.ts`

```ts
import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
import { Ticket } from "../../models/ticket.model";
// UVOZIM PUBLISHER-A
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
//

export class OrderCancelledListener extends Listener<OrderCancelledEventI> {
  channelName: CNE.order_cancelled;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;
    this.queueGroupName = tickets_microservice;
    Object.setPrototypeOf(this, OrderCancelledListener.prototype);
  }

  async onMessage(parsedData: OrderCancelledEventI["data"], msg: Message) {
    const { ticket: ticketData } = parsedData;

    const { id } = ticketData;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    ticket.set("orderId", null);

    await ticket.save();

    // PUBLISH-UJEMO EVENT -------
    await new TicketUpdatedPublisher(this.stanClient).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    //---------------------------

    msg.ack();
  }
}
```

U SLEDECEM BRANCH-U NAPRAVICEMO MANUAL TESTS
