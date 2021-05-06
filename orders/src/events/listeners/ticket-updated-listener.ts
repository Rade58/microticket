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
    // OVDE PORED OSTALIH STVARI TREBAMO DA RESTRUKTURIRAMO I
    //            version

    const { id, price, title, userId, version } = parsedData;

    // SADA DOKUMENT QUERY-UJEMO, KORISTECI I version
    // AL ISTIM STO REPLICATED DOKUMENT TREBA DA IMA
    // version MANJI ZA 1, OD ONOG, KOJI JE
    // DOSAO SA EVENTOM
    const ticket = await Ticket.findOne({ _id: id, version: version - 1 });

    // NARAVNO, AKO SE TICKET NE PRONADJE THROW-UJEMO ERROR
    // STO SMO I RANIJE DEFINISALI
    if (!ticket) {
      throw new Error("ticket not found");
    }

    // SAMO DA TI KAZEM
    // DA SI OVO
    // ticket.set("title", title);
    // ticket.set("price", price);
    // ticket.set("userId", userId);
    // MOGAO I OVAKO NAPISATI

    ticket.set({
      title,
      price,
    });

    // A KADA SE OVO DESI, version NUMBER REPLICATED TICKET-A
    // BICE INCREMENTED ZA 1
    await ticket.save();

    msg.ack();
  }
}
