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
