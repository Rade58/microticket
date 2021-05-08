import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";

// TREBACE NAM Ticket MODEL
import { Ticket } from "../../models/ticket.model";

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
    // PRVO TREBAMO PRONACI TICkET
    // AKO GA NEMA TREBAMO THROW-OVATI ERROR
    // I AKO ON VEC IMA OREDER TIED TO IT
    // TREBAMO THROW-OVATI ERROR
    //

    const { id: orderId, ticket: ticketData } = parsedData;

    const { id: ticketId } = ticketData;

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    if (ticket.orderId) {
      throw new Error("ticket already reserved");
    }

    // SADA MOZES DA UPDATE-UJES TICKET SA NOVIM ORDER ID-JEM
    ticket.set({ orderId });

    await ticket.save();

    msg.ack();
  }
}
