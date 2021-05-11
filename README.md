# KREIRACEMO `OrderCreatedListener`-A I `OrderCancelledListener`-A

***

- `mkdir payments/src/events/queue_groups`

- `touch payments/src/events/queue_groups/index.ts`

```ts
export const payments_microservice = "payments-microservice";

```

***

- `mkdir payments/src/events/listeners`

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
