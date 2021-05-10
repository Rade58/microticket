import { Stan, Message } from "node-nats-streaming";
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { expiration_microservice } from "../queue_groups";

// UVESCEMO queue INSTANCU
import { expirationQueue } from "../../queues/expiration-queue";
//

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
    // OVDE CEMO SADA DA ENQUEUE JOB
    // I ZNAS DA U NJEM UTREBA BITI orderId KAO DATA
    // ZATO CEMO TO DA UZMEMO, ALI UZECEMO I ISOS DATE STRING
    const { id: orderId, expiresAt } = parsedData;

    // EVO SADA VRSIMO ENQUEUING

    await expirationQueue.add({ orderId });

    // SADA MOZEMO DA ACK-UJEMO OUR MESSAGE
    msg.ack();
  }
}
