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
    msg.ack();
  }
}
