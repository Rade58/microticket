# DEBUGGING `"ticket:updated"` LISTENING IN `orders` MICROSERVICE

***
***

digresija:

MOZDA CE POMOCI A MOZDA I NECE: **ZABORAVIO SAM DA UPDATE-UJEM COMMON MODULE U SVIM MICROSERVICE-OVIMA**

POKUSAJ OVO DA URADIS U SVIM MICROSERVICE-OVIMA KOJI KORISTE NAS COMMON MODULE

- `yarn add @ramicktick/common --latest`
 
**IPAK NIJE POMOGLO ALI JE DOBRO STO SAM OVO URADIO, KAKO BI IMAO LATEST VERZIJU**

***
***

MOZDAJE JE PROBLEM U POZIVU `.save()`-A

**IPAK NIJE**, JER `await ticket.save()` UPDATE-UJE TICKET I ISTOVREMENO IMAMM UPDATED VREDNOSTI NA ticket-U

NAKON MAL ODEBUGGING-A OTKRIO SAM STA JE PROBLEM

***
***

# PROBLEM JE U TOME STO NISAM PROVIDE-OVAO `orderId` U PRILIKOM UPDATINGA REPLICATED Ticket-A

- `code orders/src/events/listeners/ticket-updated-listener.ts`

```ts
import {
  Listener,
  ChannelNamesEnum as CNE,
  TicketUpdatedEventI,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";
import { Ticket } from "../../models/ticket.model";
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
    // RANIJE NISAM OVDE DESTRUKTURIRAO OVAJ orderId
    const { price, title, orderId } = parsedData;

    // I PREMA TO GA NISAM NI UPDATE-OVAO

    const ticket = await Ticket.findOneByEvent(parsedData);

    if (!ticket) {
      throw new Error("ticket not found");
    }

    // DAKLE RANIJE OVDE NISAM PROSLEDIVAO orderId
    // I ZBOG TOGA SE REPLICATED TICKET NIJE UPDATE-OVAO
    // DAKLE DAVAN MU JE UVEK ISTI tittle I price
    // I ZBOG TOGAA SE UPDATE NIJE DESIO
    // ODNOSNO version NIJE BIO INCREMENTED
    ticket.set({
      title,
      price,
      // DAKLE DODAO SAM OVO, I SADA CE BITI SVE U REDU
      orderId,
    });

    await ticket.save();

    msg.ack();
  }
}

```

# VISE NISTA NE MORAMO DA POPRAVLJAMO

DAKLE SADA BI SVE TREBALO DA FUNKCIONISE

- `skaffold dev`

## SADA MOZEMO MALO MANUELNO DA TESTIRAMO

MOZES DA U INSOMNII NAPRAVIS JEDAN TICKET

MOZES I DA GA UPDATE-UJES

PA DA NAPRAVIS JEDAN ORDER

PA DA SACEKAS NA EXPIRATION

I NE BI TREBALO SADA DA SE POJAVI NI JEDAN ERROR

**DA ZAIST SVE JE BILO U REDU**
