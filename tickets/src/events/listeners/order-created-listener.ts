import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
import { Ticket } from "../../models/ticket.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;

  queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.order_created;
    this.queueGroupName = tickets_microservice;

    Object.setPrototypeOf(this, OrderCreatedListener.prototype);
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    const { id: orderId, ticket: ticketData } = parsedData;

    const { id: ticketId } = ticketData;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    if (ticket.orderId) {
      throw new Error("ticket already reserved");
    }

    ticket.set({ orderId });

    await ticket.save();

    // I OVDE REQUERY-UJEM
    const sameTicket = await Ticket.findById(ticket.id);

    if (sameTicket) {
      // I KORITIM DATA SA REQUERIED TICKETA
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
