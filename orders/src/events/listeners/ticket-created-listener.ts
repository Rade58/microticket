import {
  Listener,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";

//
import { orders_microservice } from "../queue_groups";
//

export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  channelName: CNE.ticket_created;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_created;
    // EVO DEFINISAO OVAKO
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  async onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    const { id, title, price, userId } = parsedData;

    await Ticket.create({
      id,
      title,
      price,
      userId,
    });

    msg.ack();
  }
}
