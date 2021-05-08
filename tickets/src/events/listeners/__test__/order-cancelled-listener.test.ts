import {
  OrderCancelledEventI,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket, TicketDocumentI } from "../../../models/ticket.model";
const { ObjectId } = Types;

const setup = (orderId: string, ticket: TicketDocumentI | { id: string }) => {
  // KREIRAMO LISTENERA
  const listener = new OrderCancelledListener(natsWrapper.client);

  const parsedData: OrderCancelledEventI["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, parsedData, msg };
};

// PRAVIMO ASSERTIONS

it("sets null to orderId of the ticket", async () => {
  const orderId = new ObjectId().toHexString();

  // KREIRAMO TICKET
  const ticket = await Ticket.create({
    title: "Nick Mullen inc",
    price: 69,
  });

  // ZASTO USTVARI NISAM GORE ZADAO I ORDER ID
  // PA NE IZ POSEBNOG RAZLOGA
  // SAMO ZATO STO SE NIKAD USTVARI TO NECE RADITI U MOM APP-U (NIJE USE CASE)
  // JER JEDINO KADA SE UPDATE-UJE DOBICE TAJ ORDER ID
  ticket.set("orderId", orderId);

  await ticket.save();

  expect(ticket.orderId).toEqual(orderId);

  // POZIVAMO setup

  const { listener, parsedData, msg } = setup(orderId, ticket);

  // SADA POZIVAMO onMessage

  await listener.onMessage(parsedData, msg);

  // SADA TREBAMO DA NAPRAVIM OASSERTION DA JE orderId USTVARI null

  const sameTicket = await Ticket.findById(parsedData.ticket.id);

  console.log({ sameTicket });

  expect(sameTicket).toBeDefined();

  if (sameTicket) {
    expect(sameTicket.orderId).toEqual(null);
  }
});
