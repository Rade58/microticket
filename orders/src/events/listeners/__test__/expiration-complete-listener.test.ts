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
// SVE CU SPOJITI U JEDAN TET IAKO SAM TREBAO NAPRAVITI
// MOZDA DVA ILI TRI SPEPARATE TEST-A

it("successfully processes an 'expiration:complete' event; 'order:cancelled' event have been published; ack was called", async () => {
  const { ticket, order } = await createTicketAndOrder();

  const { listener, parsedData, msg } = await setup(ticket, order);

  await listener.onMessage(parsedData, msg);

  // PROVERAVAMO DA LI JE order CNCELLED

  const sameOrder = await Order.findById(order.id);

  console.log({ sameOrder });

  if (sameOrder) {
    expect(sameOrder.status).toEqual(OSE.cancelled);

    // clientpublish BI TREBALO DA BUDE POZVAN
    // JER IZ onMessage SE PUBLISH-UJE TO `"order:cancelled"` CHANNNEL
    // I ZANIMA NAS I SAKOJIM ARGUMENTIMA

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // ZELIM DA NAPRAVIM ASSERTION ZA ARGUMENTE SA KOJIAM JE CALLED
    // MOCK, ODNONO       natsClient.publish

    // ODNOSNO ZA DRUGI ARGUMENT, POSTO JE PRVI ARGUMENT
    // publish-A, USTVARI ONAJ channelName
    const publishDataArguments = JSON.parse(
      (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    console.log({ publishDataArguments });

    expect(publishDataArguments.id).toEqual(sameOrder.id);
    expect(publishDataArguments.version).toEqual(sameOrder.version);

    await sameOrder.populate("ticket").execPopulate();

    expect(publishDataArguments.ticket.id).toEqual(sameOrder.ticket.id);
  }
  //
  // ack BI TREBAL ODA BUDE POZVAN

  expect(msg.ack).toHaveBeenCalled();
});

// SADA CEMO DA NAPRAVIOMO ASSERTION ZA
// ONDA KADA SE NE MOZE PRONACI ORDER
it("throws error if order not found; ack is not called at all", async () => {
  //

  const { listener, parsedData, msg } = await setup();

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});
