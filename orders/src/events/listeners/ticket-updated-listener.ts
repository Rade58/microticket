import {
  Listener,
  ChannelNamesEnum as CNE,
  TicketUpdatedEventI,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";
import { Ticket } from "../../models/ticket.model";
import { orders_microservice } from "../queue_groups";

export class TicketUpdatedListener extends Listener<TicketUpdatedEventI> {
  channelName: CNE.ticket_updated;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_updated;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketUpdatedListener.prototype);
  }

  async onMessage(parsedData: TicketUpdatedEventI["data"], msg: Message) {
    const { id, price, title, userId } = parsedData;

    const ticket = await Ticket.findOne({ _id: id });

    if (!ticket) {
      throw new Error("ticket not found");
    }

    // UMESTO OVOGA
    /* await Ticket.findOneAndUpdate(
      { _id: id },
      {
        title,
        price,
        userId,
      },
      { new: true, useFindAndModify: true }
    ).exec(); */
    // OVO
    ticket.set("title", title);
    ticket.set("price", price);
    ticket.set("userId", userId);

    // I OVO
    await ticket.save();

    msg.ack();
  }
}
