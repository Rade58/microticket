# HANDLING `"expiration:complete"` EVENT

DAKLE TREBA TI LISTENER U orders MICROSERVICE-U, KOJI CE SLUSATI NA POMENUTI EVENT, I KOJI CE UPDATE-OVATI ODREDJENI Order DOKUMENT, MENJAJUCU `status` FIELD TO BE `"cancelled"`

ISTO TAKO KAA CANCELL-UJEMO ORDER, ZELIM ODA PUBLISH-UJEMO I EVENT `"order:cancelled"`, PRVENSTVANO ZATO DA BI TAJ EVENT UHVATIO tickes MICROSERVICE, KAKO BI MOGAO DA "OTKLJUCA" ODREDJENI Ticket DOKUMENT DA SE SME EDIT-OVATI

## HAJDE DA KREIRAMO `ExpirationCompleteListener`-A U `orders` MICROSERVICE-U

MEDJUTIM PRE TOGA TAMO MORAMO UPDATE-OVATI @ramicktick/common LIBRARY, JER SMO JE MENJALI

- `cd orders`

- `yarn add @ramicktick/common --latest`

- `touch orders/src/events/listeners/expiration-complete-listener.ts`

```ts
import {
  Listener,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { orders_microservice } from "../queue_groups";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEventI> {
  channelName: CNE.expiration_complete;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.expiration_complete;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, ExpirationCompleteListener.prototype);
  }

  async onMessage(parsedData: ExpirationCompleteEventI["data"], msg: Message) {
    
    // DAKLE TREBA UZETI Order I PROMENIT MU status FIELD

    // ODAVDE BI MI, TAKODJE  ISSUE-OVALI `"order:cancelled"` EVENT

    msg.ack();
  }
}

```

## SADA CEMO DA QUERY-UJEMO ORDER, DA MU UPDATE-UJEMO STATUS, PA CEMO ONDA DA ISS-UJEMO `"order:cancelled"` EVENT

- `touch orders/src/events/listeners/expiration-complete-listener.ts`

```ts
import {
  Listener,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
  // TREBA NAM ENUM ZA STATUS
  OrderStatusEnum as OSE,
  //
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { orders_microservice } from "../queue_groups";
// TREBA NAM Order MODEL
import { Order } from "../../models/order.model";
// TREBA NAM I PUBLISHER
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEventI> {
  channelName: CNE.expiration_complete;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.expiration_complete;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, ExpirationCompleteListener.prototype);
  }

  async onMessage(parsedData: ExpirationCompleteEventI["data"], msg: Message) {
    
    // EVO SVE SAM OBAVIO
    
    const { orderId } = parsedData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("order not found");
    }

    order.set("status", OSE.cancelled);

    await order.save();

    // MORAM POPULATE-OVATI JER MI TREBA TICKET ID
    await order.populate("ticket").execPopulate();
    // POPULATE SI MOGAO DEFINISATI GORE I PRI SAMOM QUERYING-U

    await new OrderCancelledPublisher(this.stanClient).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    msg.ack();
  }
}

```

# SADA ZELIM DA NAPISEM TESTS ZA GORNJEG `ExpirationCompleteListener`-A, ODNSNO ZA NJEGOVU `onMessage`  METODU

- `touch orders/src/events/listeners/__test__/expiration-complete-listener.test.ts`

SAMO DA TI NAPOMENEM DA CU TESTIRATI I SA KOJIM JE ARGUMENTIMA `natsWrapper.client.publish` MOCK, BIO POZVAN (ZA SLUCAJ PUBLISHINGA `"order:cancelled"` EVENT-A IZ onMessage METODE LISTENER-A, KOJEG  OVDE PRIMARNO TESTIRAMO)

```ts
import {
  ExpirationCompleteEventI,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Ticket, TicketDocumentI } from "../../../models/ticket.model";
import { Order, OrderDocumentI } from "../../../models/order.model";
import { natsWrapper } from "../../nats-wrapper";

const { ObjectId } = Types;

const createTicketAndOrder = async () => {
  const ticket = await Ticket.create({
    title: "Stavros the mighty",
    price: 69,
  });

  const order = await Order.create({
    userId: new ObjectId().toHexString(),
    status: OSE.created,
    expiresAt: new Date().toISOString(),
    ticket: ticket.id,
  });

  return { ticket, order };
};

const setup = async (ticket?: TicketDocumentI, order?: OrderDocumentI) => {
  const parsedData: ExpirationCompleteEventI["data"] = {
    orderId: order ? order.id : new ObjectId().toHexString(),
  };

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, parsedData, msg };
};

// PRVI ASSERTION
// SVE CU SPOJITI U JEDAN TET IAKO SAM TREBAO NAPRAVITI
// MOZDA DVA ILI TRI SPEPARATE TEST-A

it("successfully processes an 'expiration:complete' event; 'order:cancelled' event have been published; ack was called", async () => {
  const { ticket, order } = await createTicketAndOrder();

  const { listener, parsedData, msg } = await setup(ticket, order);

  await listener.onMessage(parsedData, msg);

  // PROVERAVAMO DA LI JE order CNCELLED

  const sameOrder = await Order.findById(order.id);

  console.log({ sameOrder });

  if (sameOrder) {
    expect(sameOrder.status).toEqual(OSE.cancelled);

    // clientpublish BI TREBALO DA BUDE POZVAN
    // JER IZ onMessage SE PUBLISH-UJE TO `"order:cancelled"` CHANNNEL
    // I ZANIMA NAS I SAKOJIM ARGUMENTIMA

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // ZELIM DA NAPRAVIM ASSERTION ZA ARGUMENTE SA KOJIAM JE CALLED
    // MOCK, ODNONO       natsClient.publish

    // ODNOSNO ZA DRUGI ARGUMENT, POSTO JE PRVI ARGUMENT
    // publish-A, USTVARI ONAJ channelName
    const publishDataArguments = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    console.log({ publishDataArguments });

    expect(publishDataArguments.id).toEqual(sameOrder.id);
    expect(publishDataArguments.version).toEqual(sameOrder.version);

    await sameOrder.populate("ticket").execPopulate();

    expect(publishDataArguments.ticket.id).toEqual(sameOrder.ticket.id);
  }
  //
  // ack BI TREBAL ODA BUDE POZVAN

  expect(msg.ack).toHaveBeenCalled();
});

// SADA CEMO DA NAPRAVIOMO ASSERTION ZA
// ONDA KADA SE NE MOZE PRONACI ORDER
it("throws error if order not found; ack is not called at all", async () => {
  //

  const { listener, parsedData, msg } = await setup();

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});
```

DA POKRENEM TEST SUITE

- `cd orders`

- `yarn test` p `Enter` expiration `Enter`

TESTOVI SU PROSLI

# A ONO STA NISAM URADIO JESTE INSTATICIZIRANJE `ExpirationCompleteListenr`-A, I POZIVANJE `listen()` NA INSTANCI

- `code orders/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
// UVOZIMO LISTENER-A
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";

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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    // EVO LISTENUJEM
    new ExpirationCompleteListener(natsWrapper.client).listen();
    //

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (orders-mongo)");
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

# POKRENI SKAFFOLD AKO TI VEC NIJE BIO UPALJEN

- `skaffold dev`

# MOZEMO OVO TESTIRATI I U INSOMNII

POTREBNO JE DA IMAMO AUTHENTICATED USERA, ODNOSNO COOKIE (NECU TI TO POKAZIVATI JER SAM VEC MNOGO PUTA PRVIO SIGNUP I SLICNO)

POTREBNO JE KREIRATI NOVI TICKET

`"POST"` `https://microticket.com/api/tickets/`

BODY:

```json
{
	"title": "Mastodon",
	"price": 69966
}
```

RECEIVED DATA:

```json
{
  "title": "Mastodon",
  "price": 69966,
  "userId": "609958c18b60a4002370f5ec",
  "version": 0,
  "id": "609a793e2a54fa0023df140c"
}
```

KAO STO VIDIS TICKET NEMA NA SEBI `orderId`, I NE TREBA DA GA IMA KADA JE JUST CREATED 

**ONDA MOZEMO DA NAPRAVIMO ORDER ZA POMENUTIM TICKETOM**

`"POST"` `https://microticket.com/api/orders/`

BODY:

```json
{
	"ticketId": "609a793e2a54fa0023df140c"
}
```

RECEIVED DATA:

```json
{
  "status": "created",
  "ticket": "609a793e2a54fa0023df140c",
  "userId": "609958c18b60a4002370f5ec",
  "expiresAt": "2021-05-11T12:35:28.127Z",
  "version": 0,
  "id": "609a79fc41584b0018573521"
}
```

**POSTO SMO U VARIJABLOJ PODESILI DA JE EXPIRATION 20 SEKUNDI ([OVDE](orders/src/routes/new.ts)), CEKACES UPRVO TOLIKO, DOK NE VIDIS LOG U SKAFFOLD-U**, A U MEDJUVREMENU, DOK JOS NIJE PROLO TIH 20 SEKUNDI MOZES DA UZES TICKET; I ON BI TREBALO DA IMA `orderId`

`"GET"` `https://microticket.com/api/tickets/609a793e2a54fa0023df140c`

RECEIVED DATA:

```json
{
  "title": "Mastodon",
  "price": 69966,
  "userId": "609958c18b60a4002370f5ec",
  "version": 2,
  "orderId": "609a79fc41584b0018573521",
  "id": "609a793e2a54fa0023df140c"
}
```

KAO STO SAM REKAO TICKET IMA orderId

**SADA ,KADA JE PROSLO 20 SEKUNDI, KAD GETT-UJEMO ISTI TICKET, TREBALO BI DA `orderId` BUDE `null`** 

`"GET"` `https://microticket.com/api/tickets/609a793e2a54fa0023df140c`

RECEIVED DATA:

```json
{
  "title": "Mastodon",
  "price": 69966,
  "userId": "609958c18b60a4002370f5ec",
  "version": 2,
  "orderId": null,
  "id": "609a793e2a54fa0023df140c"
}
```

KAO STO VIDIS

# MEDJUTIM NA KRAJU KADA SE POSALJE EVENT `ticket:updated` IZ tickets-A, I KADA GA DOCEKA `TicketUpdatedListener`, IMACES ERROR, JER REPLICATED DATA CE IMATI WRONG VERSION

KAKO SE TO DESILO?

MORAM TO ISPITATI U SLEDECEM BRANCH-U
