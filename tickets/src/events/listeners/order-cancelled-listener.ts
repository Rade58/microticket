import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
// I OVDE UVOZIMO MODEL
import { Ticket } from "../../models/ticket.model";

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
    // UZIMAMO DATA
    const { ticket: ticketData } = parsedData;

    const { id } = ticketData;

    // TRAZIMO TICKET
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    // PODESAVAMO DA OVO SADA BUDE null
    ticket.set("orderId", null);

    await ticket.save();

    msg.ack();
  }
}
