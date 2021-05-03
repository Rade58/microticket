# `id` AND DATA REPLICATION

POGLEDAJ KAKO SI TI DEFINISAO KREIRANJE DATABASE DOKUMANTA U OVOM SLUCAJU

- `cat orders/src/events/listeners/ticket-created-listener.ts`

```ts
import {
  Listener,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";

import { orders_microservice } from "../queue_groups";

export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  channelName: CNE.ticket_created;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_created;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  async onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    const { id, title, price, userId } = parsedData;

    // TI BI DOBIO ERROR ZBOG OVAKVOG ZADAVANJA ID-JA
    await Ticket.create({
      id, // OVO NE MOES OVAKO DA URADIS, JER TO JER ZADAVANJE ID-JA JE
      // A BIT MORE COMPLICATED THAN THAT
      title,
      price,
      userId,
    });

    msg.ack();
  }
}

```

**TVOJ INTENTION JE DOBAR; TI ZAISTA ZELIS DA PODESIS ISTI ID ZA REPLICATED DOKUMENT**

NAIME TI IMAS JEDNU INSTANCU MONGO-A TIED TO `tickets` MICROSERVICE, I JEDNU INSTANCU MONGO-A TIED TO `orders` MICROSERVICE

**`LOSE BI BILO` KADA BI TI U `orders` MICROSERVICE-U STORE-OVO Ticket DOKUMENT, SA RAZLICITIM id-JEM, OD ONOG ORIGINALNOG, SA KOJIM JE Ticket DOKUMENT STORED U `tickets` MICROSERVICE-U**

# ALI KAKO DA EKSPLICITNO DEFINISEMO id KADA STORE-UJEMO DOKUMENT

**KADA CREATE-UJES DOKUMENT, AKO ZELIS DA BUDE CRETED UNDER ID, KOJI SI MU TI DODELIO, MORACES DA ZADAS UNDERSCORE `_id` ,A NE id, JER U SUPROTNOM CE `id` BITI IGNORED KAO FIELD, I ZADACE SE RANDOM _id ZA, POMENUTI NEWLY CRETED DOKUMENT**

MORACEMO DA NAPRAVIMO I SETTING U Ticket MODELU (**NA KRAJU SE ISPOSTAVILO DA NE TREBAS NISTA RADITI U Tickets MODELU ,A DAO SAM TI DOLE I OBJASNJENJE U KOMENTARIMA**)

- `code orders/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

import { Order } from "./order.model";

// DOLE SAM POKUSAO DA PROSIRIM TYPESCRIPT INTERFACE INTERFACE
// STAVLJAJUCI id FIELD
// ALI TI TO I NE TREBAS RADITI
// USTVARI DOBIO SAM TYPESCRIPT ERROR U TOM SLUCAJU

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
  },
  {
    toJSON: {
      /**
       * @param ret object to be returned later as json
       */
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  // EVO OVDE SAM DODAO id FIELD I IAMO ERROR, I UKLONIO SAM GA
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
  // ONLY HERE BECAUSE INTERFACE CAN'T BE EMPTY
  __nothing: () => void;
}

// TEKST OD RANIJE: NE OBRACAJ PAZNJU
// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING) (can be arrow)
// ticketSchema.statics.__nothing = async function (input) {/**/};
// BUILDING  METHODS ON document ( JUST SHOVING) (can't be arrow)
// ticketSchema.methods.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

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

# DAKLE TREBAO SAM SAMO DA KRIRAM DOKUMENT, ZADAVAJUCI MU _id,KAKO BI ON ZAISTA BIO KRIRAN SA TIM `_id`-JEM

- `code orders/src/events/listeners/ticket-created-listener.ts`

```ts
import {
  Listener,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";

import { orders_microservice } from "../queue_groups";

export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  channelName: CNE.ticket_created;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_created;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  async onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    const { id, title, price, userId } = parsedData;

    await Ticket.create({
      _id: id, // EVO, OVO JE SADA OK
      title,
      price,
      userId,
    });

    msg.ack();
  }
}
```
