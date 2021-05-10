# CREATING `OrderCreatedListener` INSIDE `expiration` MICROSERVICE

KREIRACEMO PRVO QUEUE GROUP NAME (TO RADIM JER VOLIM DA GA DRZIM U VARIJABLOJ)

- `mkdir `

```ts
export const expiration_microservice = "expiration-microservice";
```

PA KREIRACU I CUSTOM LISTENER-A

- `mkdir expiration/src/events/listeners`

- `touch expiration/src/events/listeners/order-created-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { expiration_microservice } from "../queue_groups";

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;
  queueGroupName: string;

  constructor(stanClent: Stan) {
    super(stanClent);

    this.channelName = CNE.order_created;
    this.queueGroupName = expiration_microservice;

    Object.setPrototypeOf(this, OrderCreatedListener.prototype);
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    // I OVDE CEMO DA SE POZABAVIMO
    // WORKINGOM WITH Bull JS
    // KOJEG MORAMO RECI DA NAS REMIND-UJE DA URADIMO NESTO
    // ZA 15 MINUTA
  }
}

```

U SLEDECEM BRANCH-U NAPRAVICEMO DEEPER OVERVIEW O TOME STA SE DESAVA U `Bull JS` LIBRARY-JU


