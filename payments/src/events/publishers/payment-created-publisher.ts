import {
  Publisher,
  PaymentCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan } from "node-nats-streaming";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEventI> {
  channelName: CNE.payment_created;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.payment_created;

    Object.setPrototypeOf(this, PaymentCreatedPublisher.prototype);
  }
}
