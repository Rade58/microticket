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
