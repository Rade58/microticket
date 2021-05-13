# DAKLE ZELIM DA U `orders` MICROSERVICE-U NAPRAVIM LISTENERA, ZA `"payment:created"` KAKO BI MOGAO DA UPDATE-UJEM STATUS ORDERA DA BUDE "`complete`"

- `touch orders/src/events/listeners/payment-created-listener.ts`

```ts
import {
  Listener,
  PaymentCreatedEventI,
  ChannelNamesEnum as CNE,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { Order } from "../../models/order.model";
import { orders_microservice } from "../queue_groups";

export class PaymentCreatedListener extends Listener<PaymentCreatedEventI> {
  channelName: CNE.payment_created;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.payment_created;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, PaymentCreatedListener.prototype);
  }

  async onMessage(parsedData: PaymentCreatedEventI["data"], msg: Message) {
    const { orderId } = parsedData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("order not found");
    }

    order.set("status", OSE.complete);

    await order.save();

    msg.ack();
  }
}

```

# INSTATICIZIRAMO NASEG `PaymentCreatedListener`-A, I OTPOCINJEMO LISTENING

- `code orders/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
// UVOZIMO
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    // EVO LISTENUJEM
    new PaymentCreatedListener(natsWrapper.client).listen();
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
    console.log(`listening on http://localhost:${PORT} INSIDE orders POD`);
  });
};

start();
```
