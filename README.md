# ABSTRACTION OUT QUERY, U KOJEM UCESTVUJE `version` U `onMessage` HANDLER-U

OVO CEMO URADITI TAKO STO CEMO URADITI HELPER NA SAMOM Ticket MODELU U `orders` MICROSERVICE-U

U SUSTINI MI PRAVIMO METODU U OKVIRU `statics`; KAO STO ZNAS TAKO KREIRAMO METODE, KOJE SE MOGU KORISTITI NA SAMOM MODELU

JA CU NAPRAVITI METODU `findOneByEvent`

- `code orders/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

import { Order } from "./order.model";

// PRVO STA CES URADITI JESTE TYPING TE METODE
// NA INTERFACE-U, KOJI DESCRIBE-UJES MODEL

// A ONDA I DEFINICIJU SAME METODE, U statics OBJEKTU SCHEMA-E

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

// EVO NA OVOM OBJEKTU DEFINISEM METODU

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

// PRAVIM METODU
ticketSchema.statics.findOneByEvent = async function (event: {
  id: string;
  version: number;
}) {
  const { id, version } = event;

  const ticket = await this.findOne({ _id: id, version: version - 1 });

  return ticket;
};

// TEKST OD RANIJE (NE OBRACAJ PAZNJU)
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

## SADA MOZES DA GORNJU METODU UPOTREBIS U `onMessage` HANDLERU

- `code orders/src/events/listeners/ticket-updated-listener.ts`

```ts
import {
  Listener,
  ChannelNamesEnum as CNE,
  TicketUpdatedEventI,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";
import { Ticket } from "../../models/ticket.model";
import { orders_microservice } from "../queue_groups";

export class TicketUpdatedListener extends Listener<TicketUpdatedEventI> {
  channelName: CNE.ticket_updated;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_updated;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketUpdatedListener.prototype);
  }

  async onMessage(parsedData: TicketUpdatedEventI["data"], msg: Message) {
    // NE TREBAS SVE DA RESTRUKTURIRAS VISE
    const { /*id,*/ price, title /*, userId, version */ } = parsedData;

    // SADA UMESTO OVOGA
    // const ticket = await Ticket.findOne({ _id: id, version: version - 1 });
    // PISEMO OVO

    const ticket = await Ticket.findOneByEvent(parsedData);
    // 

    if (!ticket) {
      throw new Error("ticket not found");
    }

    ticket.set({
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  }
}

```

