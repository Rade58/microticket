import {
  Listener,
  OrderCancelledEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
import { Ticket } from "../../models/ticket.model";
// UVOZIM PUBLISHER-A
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
//

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

    console.log({ ticket });

    // PUBLISH-UJEMO EVENT -------
    await new TicketUpdatedPublisher(this.stanClient).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });
    //---------------------------

    msg.ack();
  }
}
