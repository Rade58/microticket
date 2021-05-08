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
    // A SADA MZOES JER SAM JA DEFINISAO U ABSTRACT Listener-U
    // DA JE TAJ FIELD protected
    // ALO KAKO SAM REKAO TO TAKODJE ZNACI DA INSTACA CUSTOM LISTENERA NE MOE KORISTITI POMENUTI FIELD
    await new TicketUpdatedPublisher(this.stanClient).publish({
      //
    });

    msg.ack();
  }
}
