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

it("sets null to orderId of the ticket, and acknowledgent successfull", async () => {
  const orderId = new ObjectId().toHexString();

  // KREIRAMO TICKET
  const ticket = await Ticket.create({
    title: "Nick Mullen inc",
    price: 69,
    userId: new ObjectId().toHexString(),
  });

  // ZASTO USTVARI NISAM GORE ZADAO I ORDER ID
  // PA NE IZ POSEBNOG RAZLOGA
  // SAMO ZATO STO SE NIKAD USTVARI TO NECE RADITI U MOM APP-U (NIJE USE CASE)
  // JER JEDINO KADA SE UPDATE-UJE DOBICE TAJ ORDER ID
  ticket.set("orderId", orderId);

  await ticket.save();

  console.log({ ticket });

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

  expect(msg.ack).toHaveBeenCalledTimes(1);
});

// ASSERTION FOR FAILING

it("throws error, if ticket isn't found", async () => {
  const { listener, parsedData, msg } = setup(new ObjectId().toHexString(), {
    id: "ssafdsfdgfd",
  });

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});
