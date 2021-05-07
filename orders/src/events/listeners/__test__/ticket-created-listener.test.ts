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
