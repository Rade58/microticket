import {
  Publisher,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan } from "node-nats-streaming";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEventI> {
  channelName: CNE.expiration_complete;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.expiration_complete;

    Object.setPrototypeOf(this, ExpirationCompletePublisher.prototype);
  }
}
