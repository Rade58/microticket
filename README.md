# IMPLEMENTING PUBLISHERS FOR `"order:created"` AND `"order:cancelled"`

**PRVO CEMO DA UPDATE-UJEMO NAS MODULE, KOJI SMO REPUBLISH-OVALI U PROSLOM BRANCH-U ,JER ON SADA IMA DVA NOVA INTERFACE-A ZA EVENTS**

- `cd orders`

- `yarn add @ramicktick/common --latest`

## PRAVIMO SADA FILE-OVE ZA PUBLISHERE

- `mkdir orders/src/events/publishers`

- `touch orders/src/events/publishers/order-created-publisher.ts`

- `touch orders/src/events/publishers/order-cancelled-publisher.ts`

# DEFINISACU PRVO CUSTOM PUBLISHER-A ZA `"order:created"`

- `code orders/src/events/publishers/order-created-publisher.ts`

```ts
import {
  Publisher,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan } from "node-nats-streaming";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEventI> {
  public channelName: CNE.order_created;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_created;

    Object.setPrototypeOf(this, OrderCreatedPublisher.prototype);
  }

  // METODA publish JE DEFINISANA NA SAMOJ ABSTRACT KLASI
  // ZATO NE MORAMO DA JE PONOVO DEFINISEMO
}

```

# DEFINISACU I CUSTOM PUBLISHER-A ZA `"order:cancelled"`

- `code orders/src/events/publishers/order-created-publisher.ts`

```ts
import {
  Publisher,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan } from "node-nats-streaming";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEventI> {
  public channelName: CNE.order_cancelled;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;

    Object.setPrototypeOf(this, OrderCancelledPublisher.prototype);
  }
}

```
