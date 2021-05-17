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
