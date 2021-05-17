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
    // RANIJE NISAM OVDE DESTRUKTURIRAO OVAJ orderId
    const { price, title, orderId } = parsedData;

    // I PREMA TO GA NISAM NI UPDATE-OVAO

    const ticket = await Ticket.findOneByEvent(parsedData);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    // DAKLE RANIJE OVDE NISAM PROSLEDIVAO orderId
    // I ZBOG TOGA SE REPLICATED TICKET NIJE UPDATE-OVAO
    // DAKLE DAVAN MU JE UVEK ISTI tittle I price
    // I ZBOG TOGAA SE UPDATE NIJE DESIO
    // ODNOSNO version NIJE BIO INCREMENTED
    ticket.set({
      title,
      price,
      // DAKLE DODAO SAM OVO, I SADA CE BITI SVE U REDU
      orderId,
    });

    await ticket.save();

    msg.ack();
  }
}
