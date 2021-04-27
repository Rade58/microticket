import { Stan } from "node-nats-streaming";
import {
  Publisher,
  TicketUpdatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEventI> {
  channelName: CNE.ticket_updated;

  constructor(stan: Stan) {
    super(stan);

    this.channelName = CNE.ticket_updated;

    Object.setPrototypeOf(this, TicketUpdatedPublisher.prototype);
  }
}
