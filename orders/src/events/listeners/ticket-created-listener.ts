import {
  Listener,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";

export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  channelName: CNE.ticket_created;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_created;
    this.queueGroupName = "orders-microservice";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  async onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    const { id, title, price, userId } = parsedData;

    //
    // OVDE DAKLE DEFINISES STORING TICKET-A U DATBASE orders MICROSERVIC-E
    await Ticket.create({
      id,
      title,
      price,
      userId,
    });

    // A OVDE MORAM DEFINISATI ACKNOLADGE

    msg.ack();
  }
}
