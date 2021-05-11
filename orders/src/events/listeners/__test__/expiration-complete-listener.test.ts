import {
  ExpirationCompleteEventI,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { Types } from "mongoose";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Ticket, TicketDocumentI } from "../../../models/ticket.model";
import { Order, OrderDocumentI } from "../../../models/order.model";
import { natsWrapper } from "../../nats-wrapper";

const { ObjectId } = Types;

const createTicketAndOrder = async () => {
  const ticket = await Ticket.create({
    title: "Stavros the mighty",
    price: 69,
  });

  const order = await Order.create({
    userId: new ObjectId().toHexString(),
    status: OSE.created,
    expiresAt: new Date().toISOString(),
    ticket: ticket.id,
  });

  return { ticket, order };
};

const setup = async (ticket?: TicketDocumentI, order?: OrderDocumentI) => {
  const parsedData: ExpirationCompleteEventI["data"] = {
    orderId: order ? order.id : new ObjectId().toHexString(),
  };

  const listener = new ExpirationCompleteListener(natsWrapper.client);

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, parsedData, msg };
};

// PRVI ASSERTION

it("successfully processes an 'expiration:complete' event; ack was called", async () => {
  const { ticket, order } = await createTicketAndOrder();

  const { listener, parsedData, msg } = await setup(ticket, order);

  await listener.onMessage(parsedData, msg);

  // PROVERAVAMO DA LI JE order CNCELLED

  const sameOrder = await Order.findById(order.id);

  console.log({ sameOrder });

  if (sameOrder) {
    expect(sameOrder.status).toEqual(OSE.cancelled);
  }

  // ack BI TREBAL ODA BUDE POZVAN

  expect(msg.ack).toHaveBeenCalled();
});

// SADA CEMO DA NAPRAVIOMO ASSERTION ZA
// ONDA KADA SE NE MOZE PRONACI ORDER
it("throws error if order not found", async () => {
  //
});
