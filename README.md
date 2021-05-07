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

- `code `

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
    ack: jest.fn(),
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


