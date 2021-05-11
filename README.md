# KREIRACEMO `OrderCreatedListener`-A I `OrderCancelledListener`-A

***

- `mkdir payments/src/events/queue_groups`

- `touch payments/src/events/queue_groups/index.ts`

```ts
export const payments_microservice = "payments-microservice";

```

***

- `mkdir payments/src/events/listeners`

# PRVO CU NAPRAVITI `OrderCreatedListener`

- `touch payments/src/events/listeners/order-created-listener.ts`

```ts
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { payments_microservice } from "../queue_groups";

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_created;
    this.queueGroupName = payments_microservice;

    Object.setPrototypeOf(this, OrderCreatedListener.prototype);
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    const {
      id,
      status,
      userId,
      ticket: { price },
    } = parsedData;

    // NE TREBAS DA PASS-UJES version JER CE versio nSAMA BITI 
    // KREIRANA PRI CREATING-U DOKUMENTAI IMACE VREDNOST 0
    // MADA SI I MOGAO, ALI NIJE BITNO
    await Order.create({
      _id: id,
      status,
      userId,
      price,
    });

    msg.ack();
  }
}

```

# NAPISACEMO TEST ZA LISTENERA: `OrderCreatedListener`

- `mkdir payments/src/events/listeners/__test__`

- `touch payments/src/events/listeners/__test__/order-created-listener.test.ts`

```ts
import { OrderCreatedEventI, OrderStatusEnum as OSE } from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCreatedListener } from "../order-created-listener";
import { natsWrapper } from "../../nats-wrapper"; // ovo je mock, iako uvozis original
import { Order } from "../../../models/order.model";

const { ObjectId } = Types;

const setup = async () => {
  const parsedData: OrderCreatedEventI["data"] = {
    id: new ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    status: OSE.created,
    version: 0,
    userId: new ObjectId().toHexString(),
    ticket: {
      id: new ObjectId().toHexString(),
      price: 69,
    },
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCreatedListener(natsWrapper.client);

  return { listener, parsedData, msg };
};

it("creates replicated Order inside Orders collection inside 'payments' microservices; and calls ack", async () => {
  const { listener, parsedData, msg } = await setup();

  await listener.onMessage(parsedData, msg);

  // PROVERAVAM DA LI JE ORDER CREATED

  const order = await Order.findById(parsedData.id);

  console.log({ order });

  if (order) {
    expect(order.id).toEqual(parsedData.id);

    expect(order.version).toEqual(0);
  }

  expect(msg.ack).toHaveBeenCalled();
});

```

- `cd payments`

- `yarn test`

TEST JE PROSAO

# SADA CU DA NAPRAVIM `OrderCancelledListener`

- `touch payments/src/events/listeners/order-cancelled-listener.ts`

```ts
import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { payments_microservice } from "../queue_groups";

export class OrderCancelledListener extends Listener<OrderCancelledEventI> {
  channelName: CNE.order_cancelled;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;
    this.queueGroupName = payments_microservice;

    Object.setPrototypeOf(this, OrderCancelledListener.prototype);
  }

  async onMessage(parsedData: OrderCancelledEventI["data"], msg: Message) {

    const order = await Order.findOneByEvent(parsedData);

    if (!order) {
      throw new Error("order not found");
    }

    order.set("status", OSE.cancelled);

    await order.save();

    msg.ack();
  }
}

```

# NAPRAVICU I TEST ZA LISTENERA: `OrderCancelledListener`

- `touch payments/src/events/listeners/__test__/order-cancelled-listener.test.ts`

```ts
import {
  OrderCancelledEventI,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../nats-wrapper"; // ovo je mock, iako uvozis original
import { Order, OrderDocumentI } from "../../../models/order.model";

const { ObjectId } = Types;

const setup = async (order?: OrderDocumentI) => {
  // CREATING ORDER

  const parsedData: OrderCancelledEventI["data"] = {
    id: order ? order.id : new ObjectId().toHexString(),
    // version: 1, BITNO JE DA BUDE JEDAN, POSTO PLANIRAM
    // DAU DATBASE-U IMAM ORDER KOJI CE IMATI version: 0
    ticket: {
      id: new ObjectId().toHexString(),
    },
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCancelledListener(natsWrapper.client);

  return { listener, parsedData, msg };
};

// ASSERTIONS

it("updates status of the replicated Order, to be cancelled; ack was called", async () => {
  // CREATING An ORDER

  const order = await Order.create({
    _id: new ObjectId().toHexString(),
    status: OSE.created,
    userId: new ObjectId().toHexString(),
    price: 420,
  });

  const { listener, parsedData, msg } = await setup(order);

  await listener.onMessage(parsedData, msg);

  // REQUERYING THE ORDER

  const sameOrder = await Order.findById(order.id);

  console.log({ sameOrder });

  if (sameOrder) {
    expect(sameOrder.status).toEqual(OSE.cancelled);
  }

  expect(msg.ack).toHaveBeenCalled();
});

// ASSERTION FOR FAIL
it("throws error, if order doesn't exist; ack was never called", async () => {

  const { listener, parsedData, msg } = await setup();

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.error(err);

    expect(err).toBeDefined();
    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});


// MOGAO SI DA NAPISAES ASSERTION FAILING, KADA JE ORDER U DATBASE-U SA versionom,
// KOJI BI BIO MANJI ZA VISE OD JEDAN OD version ON parsedData
// ALI ME MRZI, I IMAO BI ISTI ERROR KAO I IZNAD
```

- `cd payments`

- `yarn test` p `Enter` cancelled `Enter`

TESTOVI SU PROSLI

# SADA MOZEMO DA INSTATICIZIRAMO LISTENERS, I DA PRIMENIMO `.listen()` NA INSTANCAMA

- `code payments/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";
// UVOZIMO LISTENERE
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";
// -----------------------------------------

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

    console.log("Connected to nats streaming server");

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    // EVO OVDE CI INSTATICIZIRATI LISTENERE
    // I PRIMENITI listen NA INSTANCAM
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    // ----------------------------

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (payments-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE payments POD`);
  });
};

start();

```

OSTAJE JOS DA POKRENES SKAFFOLD AKO TI VEC NIJE BIO UPALJEN

- `skaffold dev`
