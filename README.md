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

# NAPISACEMO TEST ZA OVO

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
    const { id, version } = parsedData;

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
