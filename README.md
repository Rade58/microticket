# TESTOVI ZA LISTENERE INSIDE `tickets` MICROSERVICE

***

SAM ODA TI KAZEM DA TI JE `natsWrapper` ALEREADY MOCKED, JER SMO TO URADILI DAVNO RANIJE

***

# PISACEMO PRVO TESTOVE ZA `onMessage` U `OrderCreatedListener` INSTANCI

- `mkdir tickets/src/events/listeners/__test__`

- `touch tickets/src/events/listeners/__test__/order-created-listener.test.ts`

```ts
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
```

- `cd tickets`

- `yarn test` p `Enter` listener `Enter`

TEST HAVE PASSED

# SADA CEMO PISATI TESTOVE ZA `onMessage` NA `OrderCancelledListener` INSTANCI

- `touch tickets/src/events/listeners/__test__/order-cancelled-listener.test.ts`

```ts
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
    id: new ObjectId().toHexString(),
  });

  try {
    await listener.onMessage(parsedData, msg);
  } catch (err) {
    console.log(err);

    expect(err).toBeInstanceOf(Error);
  }

  expect(msg.ack).not.toHaveBeenCalled();
});

```

- `cd tickets`

- `yarn test` p `Enter` cancelled-listener  `Enter`

**I OVI TESTOVI SU PROSLI**

# MEDJUTIM TI SI PREVIDEO JEDNU VEOMA BITNU STVAR

OVO JE KJAKO BITNO A TICE SE EVENT-OVA, ALI I OPTIMISTIC CONCURRENCY CONTROL-A

ODNONO TICE SE UPDATING-A DATA-E KOJA NIJE REPLICATED

AKO TO NISI PRIMETIO, PA TI TO RADIS U TVOJOM LISTENERIMA U tickets MICROSERVICE-U
