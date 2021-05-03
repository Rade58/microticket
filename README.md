# BUILDING LISTENER FOR `"ticket:updated"`

- `touch orders/src/events/listeners/ticket-updated-listener.ts`

```ts
import {
  Listener,
  ChannelNamesEnum as CNE,
  TicketUpdatedEventI,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";
import { Ticket } from "../../models/ticket.model";

// MOZEMO KORISTITI ISTI QUEUE GROUP NAME
// JER OVDE JE REC O POTPUNO DRUGOM KANALU
import { orders_microservice } from "../queue_groups";

export class TicketUpdatedListener extends Listener<TicketUpdatedEventI> {
  channelName: CNE.ticket_updated;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_updated;
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketUpdatedListener.prototype);
  }

  async onMessage(parsedData: TicketUpdatedEventI["data"], msg: Message) {
    const { id, price, title, userId } = parsedData;

    await Ticket.findOneAndUpdate(
      { _id: id },
      {
        _id: id,
        title,
        price,
        userId,
      }
    ).exec();

    msg.ack();
  }
}
```

# JA NISAM OVDE ZAVRSIO S DEVELOPINGOM `TicketCreatedListener` I `TicketUpadatedListener`

JA CU SE OPET VRATITI NA NJIH KAKO BI DEFINISALI ONO STO CE RESAVATI CONCURRENCY PROBLEMS
