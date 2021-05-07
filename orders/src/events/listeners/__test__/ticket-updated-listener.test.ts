import { TicketUpdatedEventI } from "@ramicktick/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../nats-wrapper";

import { Ticket } from "../../../models/ticket.model";

const { ObjectId } = Types;

const setup = async () => {
  // PRVO TREBA DA SE KREIRA Ticket

  const ticket = await Ticket.create({
    title: "Adam The Cool guy",
    price: 420,
  });

  const listener = new TicketUpdatedListener(natsWrapper.client);

  const parsedData: TicketUpdatedEventI["data"] = {
    id: ticket.id,
    price: 6969,
    title: "The coolest guy adam Friedland",
    userId: new ObjectId().toHexString(),
    // DA OVO NA KRAJU USPE version MORA BITI 1
    version: 1,
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, parsedData, msg };
};

it("updates and saves a ticket in replicated Ticket collection and ack was called", async () => {
  const { listener, parsedData, msg } = await setup();

  await listener.onMessage(parsedData, msg);

  // SADA MOZEMO DA PROVERIMO DA LI JE DATA USPESNO
  // UPDATED, ODNOSNO DA LI JE Ticket USPESNO UPDATED

  const ticket = await Ticket.findById(parsedData.id);

  expect(ticket).toBeTruthy();

  if (ticket) {
    expect(ticket.version).toEqual(1);
  }

  // MOZEMO IZMENITI MALO PARSED DATA
  parsedData.title = "Kevin Federlajner";

  // I OPET POZVATI onMessage

  await listener.onMessage(parsedData, msg);

  // ASSERT-UJEMO DA JE ack CALLED
  expect(msg.ack).toHaveBeenCalled();

  // ALI ZATO STO SAM onMessage POZVAO DVA PUTA
  // ASSERT-UJEM DA JE ack CALLED 2 PUTA

  expect(msg.ack).toBeCalledTimes(2);

  // ASSERT-UJEM DA TICKET SADA IMA vesrsion: 2

  const sameTicket = await Ticket.findById(parsedData.id);

  expect(sameTicket).toBeTruthy();

  if (sameTicket) {
    expect(SameTicket.version).toEqual(2);
  }
});
