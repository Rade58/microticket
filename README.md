# DON'T CANCEL COMPLETED ORDERS

OPET MORAM POSMATRATI SCENARIO:

**DAKLE NO MATTER WHAT, "`expiration:complete`" EVENT CE SE ISS-EOVATI, KADA PRODJE DELAY, I TO CE SE DAKLE DOGODITI UVEK**

IAKO MI DO SADA NISM NISTA RADILI ZA PAYMENT, ALI KADA BI IMAO TKAV MICROSERVICE, I KADA BI KORISNIK NAPRAVIO PAYMENT ,ODNOSNO KADA COMPLETE-UJE PAYMENT, ODNOSNO KADA SE STATUS ORDERA PROMENI NA  `"complete"`; **I DALJE MOZE PRISTICI `"expiration:complete"` EVENT, KOJ ICE STATUS PROMENITI NA `cancelled`**

TO MI MOZEMO DA PROMENIMO

- `code orders/src/events/listeners/expiration-complete-listener.ts`

```ts
import {
  Listener,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { orders_microservice } from "../queue_groups";
import { Order } from "../../models/order.model";
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
    const { orderId } = parsedData;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error("order not found");
    }

    // AKO JE STATUS COMPLETE, NECEMO PODESAVATI CANCEL

    if (order.status === OSE.complete) {
      // ALI NECEMO NI THROW-OVTI ERROR
      // NEGO CEMO RETURN-OVATI EARLY
      // A MORAMO I ACKNOWLEDGOVATI

      return msg.ack();
      // I TO JE SVE
    }

    order.set("status", OSE.cancelled);

    await order.save();

    const sameOrder = await Order.findById(order.id).populate("ticket").exec();

    if (sameOrder) {
      await new OrderCancelledPublisher(this.stanClient).publish({
        id: sameOrder.id,
        version: sameOrder.version,
        ticket: {
          id: sameOrder.ticket.id,
        },
      });
    }

    msg.ack();
  }
}
```

- `skaffold dev`
