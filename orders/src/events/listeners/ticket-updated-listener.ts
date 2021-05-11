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
    // NE TREBAS SVE DA RESTRUKTURIRAS VISE
    const { /*id,*/ price, title /*, userId, version */ } = parsedData;

    // SADA UMESTO OVOGA
    // const ticket = await Ticket.findOne({ _id: id, version: version - 1 });
    // PISEMO OVO

    console.log({ parsedData });
    console.log("-----------------------------------");

    const tickets = await Ticket.find({});

    console.log({ tickets });

    const ticket = await Ticket.findOneByEvent(parsedData);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    ticket.set({
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  }
}
