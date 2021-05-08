# TESTING LISTENERS

ONO STO CEMO RADITI TOKOM TESTOVA JESTE:

- `KREIRANJE INSTANCE, ODREDJENOG NASEG CUSTOM LISTENERA`

- `FBRICATE-OVACEMO parsedData OBJECT, KOJI JE ARGUMENT` **onMessage** `METODE CUSTOM LISTENER-A`

- `FABRICATE-OVACEMO` msg `KOJI JE` Message `INSTANCA`, **A KOJI JE DRUGI ARGUMENT `onMessege` METODE NASEG CUSTOM LISTENER-A**

- `UZECEMO TAJ FAKE parsedData, I FAKE msg OBJECT, I PASS-OVACEMO TO U` **onMessage** FUNKCIJU

**I ONDA CEMO SE POSVEITI ASSERTIONIMA O TOME DA LI `onMessage` RADI APPROPRIATE THINS**

- `mkdir orders/src/events/listeners/__test__`

- `touch orders/src/events/listeners/__test__/ticket-created-listener.test.ts`

ZA SADA CU SAMO DODATI NKE ASSERTIONS, PRE NEGO STO ZADAM BILO KAKVE IMPORT STATEMENTSE I OSTALE STVARI

```ts
it("creates and saves a ticke in replicated Ticket collection", async () => {
  // create the instance of the listener
  // create fake event data
  // create fake msg object
  // call onMessage function with a event data object and a msg
  // write assertions to make sutre that ticket was created
});

it("successfully ack the message", async () => {
  // DO AL STEPS FROM ABOVE TEST
  // WRITE ASSERTIONS TO MAKE SURE ack FUNCTION IS CALLED
});

```

POKAZAO SAM TI OVO OVAKO OVDE, JER CEMO KORISTITI GOTOVO ISTE KORAKE PRI TESTIRANJU SVAKOG NASEG CUSTOM LISTNER-A

A TAKODJE CEMO NAPRAVITI I HELPERE, JER NECEMO ZELETI STALNO DA RADIMO JEDNU TE ISTU STVAR VISE PUTA

# SADA CEMO DA NAPRAVIMO HELPERA, KOJ ICE SE ZVATI `setup`

- `code orders/src/events/listeners/__test__/ticket-created-listener.test.ts`

```ts
// TREBA NA NAS CUSTOM LISTENER, KOJEG CEMO KREIRATI
import { TicketCreatedListener } from "../../listeners/ticket-created-listener";

// TREBACE NAM EVENT INTERFCE DA ZNAMO KOJI CEMO DATA FAKE-OVATI
import { TicketCreatedEventI } from "@ramicktick/common";

// TREBACE NAM natsWrapper, KOJ ISMO RANIJE MOCK-OVALI
// STO ZNACI DA CEMO DOBITI FAKE natsWrapper-A
import { natsWrapper } from "../../nats-wrapper";

// HELPER IZ MOGO-A ZA PRAVLJENJE ID-JA
import { Types } from "mongoose";
const { ObjectId } = Types;

// TREBA NAM I OVO
import { Message } from "node-nats-streaming";
//

// PRAVIMO HELPER-A --------------------------
const setup = () => {
  // INSTATICIZIRAMO LSITENERA
  const listener = new TicketCreatedListener(natsWrapper.client);

  // KREIRAM OFAKE DATA
  const parsedData: TicketCreatedEventI["data"] = {
    id: new ObjectId().toHexString(),
    price: 69,
    title: "Stavros the mighty",
    userId: new ObjectId().toHexString(),
    version: 0,
  };

  // KREIRAMO FAKE Message INSTANCU
  // AL IIZ NJE NAM NE TREBA NISTA OSIM ack
  // ZATO SAM NAPRAVIO IGNORE
  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    // ALI OVO CE BITI JEST MOCK FUNCTION
    // DAKLE ZELIMO DA VIDIM ODA L ICE SE OVA FUNKCIJA IZVRSITI
    // VEC SAM TI RANIJE POKAZIVAO
    ack: jest.fn(),
    // NA ISTI NACCIN NAM JE MOCKED I natsWrapper
  };

  return { parsedData, msg, listener };
};

// -------------------------------------------

it("creates and saves a ticke in replicated Ticket collection", async () => {
  // create the instance of the listener
  // create fake event data
  // create fake msg object
  // call onMessage function with a event data object and a msg
  // write assertions to make sutre that ticket was created
});

it("successfully ack the message", async () => {
  // DO AL STEPS FROM ABOVE TEST
  // WRITE ASSERTIONS TO MAKE SURE ack FUNCTION IS CALLED
});

```

# SADA MOZEMO `setup` HELPERA DA KORISTIMO U NASIM TESTOVIMA

- `code orders/src/events/listeners/__test__/ticket-created-listener.test.ts`

```ts
import { TicketCreatedEventI } from "@ramicktick/common";
import { Types } from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedListener } from "../../listeners/ticket-created-listener";
// mocked
import { natsWrapper } from "../../nats-wrapper";
//

// TREBACE NAM I Ticket DA MOZEMO PROVERITI DA LI JE
// TICKET DOCUMENT CREATED
import { Ticket } from "../../../models/ticket.model";
//

const { ObjectId } = Types;

const setup = () => {
  const listener = new TicketCreatedListener(natsWrapper.client);
  const parsedData: TicketCreatedEventI["data"] = {
    id: new ObjectId().toHexString(),
    price: 69,
    title: "Stavros the mighty",
    userId: new ObjectId().toHexString(),
    version: 0,
  };

  // eslint-disable-next-line
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { parsedData, msg, listener };
};

// EVO PISEMO PRVI TEST
it("creates and saves a ticke in replicated Ticket collection", async () => {
  const { listener, msg, parsedData } = setup();

  // call onMessage function with a event data object and a msg

  // U PITANJU JE async FUNKCIJA
  // JER KAO STO ZNAS U NJOJ OBAVLJAMO I STORING TO THE DATABESE
  // STO SMO VOLELI DA RADIM OSA await

  await listener.onMessage(parsedData, msg);

  // write assertions to make sutre that ticket was created
  // MORAM OPRVO DA UZMEMO TICKET ,AKO JE TICKET CREATED

  const ticket = await Ticket.findOne({ price: 69 });

  expect(ticket).toBeTruthy();

  if (ticket) {
    expect(ticket.title).toBeDefined();
    expect(ticket.price).toBeDefined();
    expect(ticket.version).toEqual(0);
  }
});

it("successfully ack the message", async () => {
  // DO AL STEPS FROM ABOVE TEST

  const { listener, msg, parsedData } = setup();

  await listener.onMessage(parsedData, msg);

  // WRITE ASSERTIONS TO MAKE SURE ack FUNCTION IS CALLED

  expect(msg.ack).toHaveBeenCalled();
});

```

- `cd orders`

- `yarn test` w `Enter` p `Enter` listener `Enter`

**OBA TESTA SU PROSLA**

# SADA CEMO DA NAPISEMO TEST I ZA TICKET UPDATED LISTENER-A

- `code orders/src/events/listeners/__test__/ticket-updated-listener.test.ts`

```ts
import { TicketUpdatedEventI } from "@ramicktick/common";
import { Message } from "node-nats-streaming";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../nats-wrapper";

import { Ticket } from "../../../models/ticket.model";

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

```

SADA MOZES POKRENUTI TEST

- `cd orders`

- `yarn test` p `Enter` ticket-updated `Enter`

I TEST JE ZAISTA PROSAO

## ALI HAJDE SADA DA NPISEMO TEST PO KOJEM SE SALJE `version`, CIJA VREDNOST JE OUT OF ORDER

DAKLE TEST PO KOJEJ CE SE SLATI version, KOJI NECE BITI ZA 1 VECI OD ONOG NA POHRANJENOOM REPLICATED Ticket DOKUMENTU

- `code orders/src/events/listeners/__test__/ticket-updated-listener.test.ts`

```ts
// ...
// ...

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
})
```

I OVAJ TEST JE PROSAO

