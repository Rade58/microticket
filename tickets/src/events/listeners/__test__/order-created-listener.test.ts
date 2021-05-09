// TREBA NAM INTERFACE DA BI USPESNO FAKE-OVALI, DATA KOJ IDOLAZI
// SA EVENTOM
import { OrderCreatedEventI, OrderStatusEnum as OSE } from "@ramicktick/common";
// TREBA NA I Message
import { Message } from "node-nats-streaming";

// TREBA NAM GENERATOR ZA MONGODB ID-JEVE
import { Types } from "mongoose";

import { OrderCreatedListener } from "../order-created-listener";
// OPET TI NAPOMINJEM DA JE OVO MOCK, IAKO JE UVOZ KAO DA UVOZIS REAL THING
import { natsWrapper } from "../../nats-wrapper";

import { Ticket, TicketDocumentI } from "../../../models/ticket.model";

const { ObjectId } = Types;

// DAKLE I U OVOM TESTU, KAO I U ONIM
// KOJE SMO RADILI U orders MI
// INSTANTICIZIRAMO LISTENRA
// DA BI MI POZIVALI ONDA onMessage MANUELNO
// SIMULIRAJUCI TAKO HANDLING INCOMMING EVENT-A

// MORACEMO DA MOCK-UJEMO msg.ack, ODNONO ZA TO CEMO
// KORITITI jest mock function

// NAPRAVICEMO PRVO HELLPERA, U KOJEM CEMO DA
// INSTATICIZIRAMO LISTENERA, I PROSLEDICEMO IZ TOG
// HELPERA
// - parsedData, KOJI CEMO TYPE-OVATI, AL ICEMO GA MI FABRICATE-OVATI
// - msg ODNOSNO FAKED Message INSTANCU
// - I LISTENER INSTANCU

const setup = async (
  ticket: TicketDocumentI | { id: string; price: number; userId: string }
) => {
  // KREIRAMO LISTENERA
  const listener = new OrderCreatedListener(natsWrapper.client);

  const parsedData: OrderCreatedEventI["data"] = {
    id: new ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    status: OSE.created,
    // OVO JE USER ID ZA KORISSNIKA KOJI PRAVI ORDER
    userId: new ObjectId().toHexString(),
    version: 0,
    // OVDE MORA BITI DATA TICKETA, JER SMO DEFINISALI DA
    // SE IZ KANAL `"order:created"` I TOO SALJE, JER CE MOZDA
    // TREBATI NEKI MDRUGIM MICROSERVICE-OVIMA
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // MOCK-UJEMO ack INSIDE OF IT

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, parsedData, msg };
};

// SADA MOZEMO DA PRAVIMO ASSERTIONS

it("sucessfully processes event, updates a orderId field on ticket, and ack is succesfully called", async () => {
  // KREIRAMO TICKET
  // OVO JE USER KOJI OWN-UJE TICKET
  const userId = new ObjectId().toHexString();
  // NE CES GA KORISTITI KAO userId ZA ORDER
  // JER DRUGI USER PRAVI ORDER

  // PRVO CEMO KREIRATI Ticket
  // KOJI NARAVNO NECE IMATI orderId NA SEBI (SECAS SE ZASTO, I SECAS SE ZASTO NE MOZE ODMAH IMATI)

  const myTicket = await Ticket.create({
    price: 69,
    title: "Stavros the mighty",
    userId,
  });

  const { listener, parsedData, msg } = await setup(myTicket);

  // TICKET IS CREATED BY CALLING setup (SO WE ARE GOOD ON THAT)

  // FAKING MESSAGE INCOMMING, BY CALLING onMessage

  await listener.onMessage(parsedData, msg);

  // PRONALAZIMO TICKET

  const ticket = await Ticket.findById(parsedData.ticket.id);

  console.log({ ticket });

  if (ticket) {
    // PRAVIMO ASSERTION DA JE orderId NA TICKETU
    expect(ticket.orderId).toBeTruthy();

    // I DA IMA TACNO ONU VREDNOST, KOJU IMA ORDER ID POSLAT SA EVENT DATOM
    expect(ticket.orderId).toEqual(parsedData.id);
  }

  // ack IS CALLED ONCE
  expect(msg.ack).toHaveBeenCalledTimes(1);
});

// MOZEMO NAPRAVITI I NEKE ASSERTIONS ZA FAILING

it("returns error if ticket doesn't exist", async () => {
  // PRAVIM SAMO RANDOM DATA ZA TICKET KOJI NE POSTOJI
  const nonExistantTicketData = {
    id: new ObjectId().toHexString(),
    price: 420,
    userId: new ObjectId().toHexString(),
  };

  const { listener, parsedData, msg } = await setup(nonExistantTicketData);

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});

it("publishes event from the onMessage method of OrderCreatedListener Instance", async () => {
  const myTicket = await Ticket.create({
    price: 69,
    title: "Stavros the mighty",
    userId: new ObjectId().toHexString(),
  });

  const { listener, parsedData, msg } = await setup(myTicket);

  await listener.onMessage(parsedData, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  // EVO PRVO PARSE-UJEMO EVENT DATA, JER JE ONO JSON STRING

  const parsedArgs = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  // MEDJUTIM PRE EXPECTATION, MORAM OREQUERY-EOVATI TICKET

  console.log({ parsedArgs, myTicket });

  const sameTicket = await Ticket.findById(myTicket.id);

  if (sameTicket) {
    console.log({ sameTicket });
    // PRAVIMO EXPECTATION
    expect(parsedArgs.orderId).toEqual(sameTicket.orderId);
  }
});
