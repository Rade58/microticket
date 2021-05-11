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
  NotFoundError,
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
      throw new NotFoundError();
    }

    order.set("status", OSE.cancelled);

    await order.save();

    // MORAM POPULATE-OVATI JER MI TREBA TICKET ID
    await order.populate("ticket").execPopulate();

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



