# LISTENERS INSIDE `tickets` MICROSERVICE

NAIME POTREBNO JE DEFINISATI I LISTENERS INSIDE `tickets` MICROSERVICE

ONI BI BILI ZA KANALE `"order:created"` I `"order:cancelled"`

A ZASTO?

**PA DA MI NEJEKO PODESILI ADDITIONAL FIELD NA TICKETU, KOJI CE OZNACITI DA Ticket DOKUMENT NE MOZE BITI EDITED OD STRANE KORISNIKA KOJI GA JE NAPRAVIO; U SLUCAJ UDA JE ORDER VEC KREIRAN ZA POMENUTI TICKET**

A KADA KORISNIK KOJI JE NAPRAVIO ORDER CACELL-UJE ISTI, TADA NA TICKETU TREBA OZNACITI DA JE DOZVOLJEN NJEGOV EDDITING, ODNONO UPDATING

# PRVO STA CU URADITI JESTE DEFINISATI DA Ticket DOKUMENT, MOZE IMATI I `orderId` FIELD, KOJI CCE BITI OPCION, ODNONO KADA SE TICKET KREIRA, ON NE MORA POSTOJATI, A ZASIGURNO NECE NI POSTOJATI, JER KADA SE TICKET KREIRA, JASNO JE DA NE POSTOJI ORDER ZA NJEGA JER GA NIKO JOS NIJE NAPRAVIO 

NAIME, KADA JE OVAJ FIELD DEFINISAN TO CE ZNACITI DA JE TICKET RESEVED, ODNOSN ODA ZA NJEG POSTOJI ORDER

A KADA SE ORDER CACELL-UJE, TREBALO BI DA SE OVOM FIELD-U DODELI `null` NA PRIMER

- `code tickets/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";

// EVO, U SCHEMA-I DEFINISEMO NOVI FIELD orderId
// A POSLE TOGA JOS SAMO U TYPESCRIPT INTERFACE-U
// ZA DOKUMENT, ISTO TYPE-UJEMO POMENUTI FIELD

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    // EVO GA OVDE
    orderId: {
      type: String,
    },
    // --------
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

// EVO JOS OVDE DA TYPE-UJEMO orderId
//  I TO JE SVE
// SAM OSTO CU GA TYPE-OVATI KAO OPTIONAL FIELD

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  version: number;
  title: string;
  price: number;
  userId: string;
  // EVO GA
  orderId?: string;
  // I NISTA VISE NISAM DEFINISAO
}

/**
 * @description interface for things, among others I can search on obtained document
 */
interface TicketDocumentI extends Document, TicketFields {
  //
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // NECU NISTA DODAVATI, ALI OVDE BI TYPE-OVAO STATICKE METODE KOJE
  // SAMO TI OSTAVLJAM OVO KAO TEMPLATE DEFINISANJA
  __nothing: (input: string) => void; //stavio samo jer moram nesto da dodam, ali ovu metodu necu sigurno definisati
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// ticketSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
```

**ISTO TAKO, POSTO POMENUTI FIELD NIJE REQUIRED, NE MORAMO DA REDEFINISEMO CODE U RAOUTE HANDLERIMA, KONKRETNO PRI CREATINGU NEW TICKET-A, JER SE TAJ FIELD TADA NE KORISTI, A NEMAM NI SLUCAJ U DRUGIM HANDLERIMA DA SE UPDATE-UJE, POMENUTI FIELD**

A ZASTO NISAM KORISTIO OBICNI BOOLEAN FIELD?

PA AUTOR WORKSHOPA KAZE DA JE OVO JEDAN NACIN FUTURE PROOOFINGA, ZA tickets MICROSERVICE

NA PRIMER, KADA BI SAMO KORISTIO BOOLEAN, USER WHO OWNS A TICKET BIO BI AGNOSTIC O SAZNANJU KO ORDERUJE NJEGOV TICKET I TAKO DALJE

NA PRIMER U BUDUCNOSTI BI TI MOZDA DEFINISAO NEKI UI ZA KREATORA TICKETA KAKO BI MOGAO DA VIDI KO KO JE ORDEROVAO TA JTICKET, A KADA JE DOSSTUPAN ORDER ID, ONDA SE MOE GRADITI UPON THAT

ZATO SAM STAVIO ORDER ID

# PRATIM PRAKSU PO KOJOJ QUEUE GROUP NAME CUVAM U VARIJABLOJ, TAKO DA CU TO ODMAH OVDE DA URADIM

- `mkdir tickets/src/events/queue_groups`

- `touch tickets/src/events/queue_groups/index.ts`

```ts
export const tickets_microservice = "tickets-microservice";
```

# SADA MOZEMO DA SE POSVETIMO KREIRANJEM LISTENERA U `tickets` MICROSERVICE-U

***

PRVO ZA SLUSANJE NA `"order:created"`

- `mkdir tickets/src/events/listeners`

- `touch tickets/src/events/listeners/order-created-listener.ts`

```ts
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";

import { tickets_microservice } from "../queue_groups";

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;

  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_created;
    this.queueGroupName = tickets_microservice;
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    //
  }
}
```

***

PA DEFINISEMO LISTENER ZA SLUSANJE NA `"order:cancelled"`

- `touch tickets/src/events/listeners/order-cancelled-listener.ts`

```ts
import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";

export class OrderCancelledListener extends Listener<OrderCancelledEventI> {
  channelName: CNE.order_cancelled;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;
    this.queueGroupName = tickets_microservice;
  }

  async onMessage(parsedData: OrderCancelledEventI["data"], msg: Message) {
    //
  }
}
```

***

POSLE CU DEFINISATI SVU LOGIKU U `onMessage` HANDLERIMA

# SADA CU DA INSTATICIZIRAM POMENUTE LISTENERE, I DA IONDA IMAPLEMENTIRAM LISTENER INSTANCE, TAK OSTO CU PRIMENITI `.listen()` METODU

- `code tickets/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";

// UVOZIM MOJE CUSTOM LISTENERS
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
//

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    // EVO, OVDE SVE OBAVLJAM STA SAM REKAO
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    // --------------------------------------

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (tickets-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE tickets POD`);
  });
};

start();

```

# SADA MOZEMO DA DEFINISEMO CODE INSIDE `onMessage` METODA, NASA DVA CUSTOM LISTENER-A

- `code tickets/src/events/listeners/order-created-listener.ts`

```ts
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";

// TREBACE NAM Ticket MODEL
import { Ticket } from "../../models/ticket.model";

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;

  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_created;
    this.queueGroupName = tickets_microservice;
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    // PRVO TREBAMO PRONACI TICkET
    // AKO GA NEMA TREBAMO THROW-OVATI ERROR
    // I AKO ON VEC IMA OREDER TIED TO IT
    // TREBAMO THROW-OVATI ERROR

    const { id: orderId, ticket: ticketData } = parsedData;

    const { id: ticketId } = ticketData;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    // MISLIM DA SE OVO NE MOZE DESITI
    // ALI ZA SVAKI SLUCAJ STAVLJAM OVU USLOVNU IZJAVU
    if (ticket.orderId) {
      throw new Error("ticket already reserved");
    }

    // SADA MOZES DA UPDATE-UJES TICKET SA NOVIM ORDER ID-JEM
    ticket.set({ orderId });

    await ticket.save();

    msg.ack();
  }
}

```

**SADA DA TO URADIMO I ZA DRUGU onMessage, U SLUCAJU CANCELLING-A ORDER-A**

- `code tickets/src/events/listeners/order-cancelled-listener.ts`

```ts
import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
// I OVDE UVOZIMO MODEL
import { Ticket } from "../../models/ticket.model";

export class OrderCancelledListener extends Listener<OrderCancelledEventI> {
  channelName: CNE.order_cancelled;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;
    this.queueGroupName = tickets_microservice;
  }

  async onMessage(parsedData: OrderCancelledEventI["data"], msg: Message) {
    // UZIMAMO DATA
    const { ticket: ticketData } = parsedData;

    const { id } = ticketData;

    // TRAZIMO TICKET
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    // PODESAVAMO DA OVO SADA BUDE null
    ticket.set("orderId", null);

    await ticket.save();

    msg.ack();
  }
}

```


