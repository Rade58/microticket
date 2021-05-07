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
