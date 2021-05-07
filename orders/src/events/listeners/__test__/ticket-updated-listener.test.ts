import { TicketUpdatedEventI } from "@ramicktick/common";
import { Message } from "node-nats-streaming";

// import { Error } from "mongoose";

import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../nats-wrapper";

import { Ticket } from "../../../models/ticket.model";

// const { VersionError } = Error;

const setup = async () => {
  // PRVO TREBA DA SE KREIRA Ticket
  const ticket = await Ticket.create({
    title: "Adam The Cool guy",
    price: 420,
  });

  const listener = new TicketUpdatedListener(natsWrapper.client);

  const parsedData: TicketUpdatedEventI["data"] = {
    // OBEZBEDICU SVE ISTE VREDNOSTI KAO U CREATED DOKUMENTU
    id: ticket.id,
    price: ticket.price,
    title: ticket.title,
    userId: ticket.userId,
    version: ticket.version,
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, parsedData, msg };
};

// SADA MOGU NAPISATI TEST, A KORISTICU I GORNJEG HELPER-A

it("updates and saves a ticket in replicated Ticket collection and ack was called", async () => {
  const { listener, parsedData, msg } = await setup();

  console.log({ id: parsedData.id });

  // SADA MOZEMO DA NAMMERNO UPDATE-UJEMO NESTO
  // ---- NA PRIMER MOZEM ODA PROMENIMO price
  // ********* I NE ZABORAVI DA PROMENIS version **********
  // ********* MI GA MENJAMO JER SIMULIRAMO KAO DA JE
  // ********* EVENT PUBLISHED, A TADA JE version UVECAN ZA 1

  parsedData.price = 666;

  parsedData.version = parsedData.version + 1;

  // SADA MOZEMO RECI DA JE PUBLISHED EVENT SA
  // UCECANIM     version

  // I DA JE EVENTUALLY DDOSAO DO LISTENER-A
  await listener.onMessage(parsedData, msg);

  // SADA MOZEMO DA PROVERIMO DA LI JE DATA USPESNO
  // UPDATED, ODNOSNO DA LI JE Ticket USPESNO UPDATED

  const ticket = await Ticket.findById(parsedData.id);

  console.log({ ticket });

  expect(ticket).toBeTruthy();

  if (ticket) {
    expect(ticket.version).toEqual(1);
  }

  // MOZEMO OPET SIMULIRAATI UPDATE
  parsedData.title = "Kevin Federlajner";
  parsedData.version = parsedData.version + 1;

  // I OPET POZVATI onMessage
  await listener.onMessage(parsedData, msg);

  // MOZEMO I OVO SADA URADITI
  // ASSERT-UJEMO DA JE ack CALLED
  expect(msg.ack).toHaveBeenCalled();

  // ALI ZATO STO SAM onMessage POZVAO DVA PUTA
  // ASSERT-UJEM DA JE ack CALLED 2 PUTA
  expect(msg.ack).toBeCalledTimes(2);

  // ASSERT-UJEM DA TICKET SADA IMA vesrsion: 2

  const sameTicket = await Ticket.findById(parsedData.id);

  expect(sameTicket).toBeTruthy();

  if (sameTicket) {
    expect(sameTicket.version).toEqual(2);
  }
});

it("throws Error if ticket version is out of order", async () => {
  const { listener, parsedData, msg } = await setup();

  // SIMULIRAMO UPDATE
  parsedData.title = "Nick Mullen eatin Cullen";

  // ALI NE INCREMENTIRAMO VERSION, STO CE BITI UZROK ZA ERROR

  // POSTO OVDE OCEKUJM ERROR, PRAVICU try catch

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeDefined();
  }

  // HAJDE DA PROBAM ODA INCREMENTIRAM OVERSION ZA VISE OD 1
  // MOZDA 2
  // I TADA OCEKUJEMO ERROR

  parsedData.version = parsedData.version + 2;

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeDefined();
  }

  // NARAVNO OVDE JE JASNO DA ack NE BI TREBALO
  // NI JEDNOM DA BUDE POZVAN

  expect(msg.ack).not.toHaveBeenCalled();
});
