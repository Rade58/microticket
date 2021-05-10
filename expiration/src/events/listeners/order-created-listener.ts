import { Stan, Message } from "node-nats-streaming";
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { expiration_microservice } from "../queue_groups";
import { expirationQueue } from "../../queues/expiration-queue";

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
    const { id: orderId, expiresAt } = parsedData;

    // DAKLE VEC SMO PRORACUNALI KOLIKO MILISEKUNDI
    // IMA OD CURRENT TIME DO ONOG TIME KOJI PPOKAZUJE
    // SOME MOMENT IN FUTURE
    const delay = new Date(expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add(
      { orderId },
      {
        // EVO PODESAVAMO OVDE POMENUTI DELAY, KOJI JE
        // KAO STO SMO REKLI, U MILISEKUNDAMA
        delay,
      }
    );

    msg.ack();
  }
}
