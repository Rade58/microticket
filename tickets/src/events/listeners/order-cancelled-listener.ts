import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
import { Ticket } from "../../models/ticket.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCancelledListener extends Listener<OrderCancelledEventI> {
  channelName: CNE.order_cancelled;
  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_cancelled;
    this.queueGroupName = tickets_microservice;
    Object.setPrototypeOf(this, OrderCancelledListener.prototype);
  }

  async onMessage(parsedData: OrderCancelledEventI["data"], msg: Message) {
    const { ticket: ticketData } = parsedData;

    const { id } = ticketData;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    ticket.set("orderId", null);

    await ticket.save();

    // EVO I OVDE REQUERY-UJEM TICKET
    const sameTicket = await Ticket.findById(ticket.id);

    if (sameTicket) {
      await new TicketUpdatedPublisher(this.stanClient).publish({
        id: sameTicket.id,
        price: sameTicket.price,
        title: sameTicket.title,
        userId: sameTicket.userId,
        version: sameTicket.version,
        orderId: sameTicket.orderId,
      });
    }

    msg.ack();
  }
}
