import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan, Message } from "node-nats-streaming";
import { tickets_microservice } from "../queue_groups";
import { Ticket } from "../../models/ticket.model";
// SADA CU UVESTI I       TicketUpdatedPublisher
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
// ALI NAM TREBA I NATS CLIENT
// MEDJUTIM ,NECEMO GA KORISTITI SA natsWrapper-A
// JER client POSTOJI NA INSTANCI SLEDECE KLASE, KAO protected FIELD
// JER TAKO SMO DEFINISALI KROZ Listener ABSTRACT CLASS-U

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

    // DAKLE RANIJE, NISI MOGAO UZETI stanClent SA this
    // A SADA MOZES JER SAM JA DEFINISAO U ABSTRACT Listener-U
    // DA JE TAJ FIELD protected
    // ALI KAKO SAM REKAO, TO TAKODJE ZNACI DA INSTACA CUSTOM LISTENERA
    // NE MOZE KORISTITI POMENUTI FIELD, DOK EXTENDING CLASS MOZE

    // ISTO TAKO VAZNO JE PODSETITI SE DA JE GORNJIM ticket.save()
    // POZIVOM OSIGURANO DA JE version INCRMENTED BY ONE

    // ISTO TAKO NE MORAS DA REFETCH-UJES TICKET IZ DATBASE-A
    // JER GORNJIM save POZIVOM TI SI OBEZBEDIO PROMENE NA TICKETU
    // ONE CE BITI PRISUTNE NA ticketu NA KOJEM SI POZVAO save

    await new TicketUpdatedPublisher(this.stanClient).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
