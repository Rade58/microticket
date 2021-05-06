# `version` LOGIC, INSIDE `onMessage`

STO SE TICE EVENTA `"ticket:created"`, U TOM SLUCAJU NEMEMO NIKAKV VEC REPLICATED DOKUMENT U DATBASE-U, INSIDE `orders` MICROSERVICE

ALI MOZEM ODEFINISATI TU LOGIKU PROVERE `version`-A, KAD SE LISTEN-UJE NA EVENT IZ KANALA `"ticket:updated"`

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
    // OVDE PORED OSTALIH STVARI TREBAMO DA RESTRUKTURIRAMO I
    //            version

    const { id, price, title, userId, version } = parsedData;

    // SADA DOKUMENT QUERY-UJEMO, KORISTECI I version
    // AL ISTIM STO REPLICATED DOKUMENT TREBA DA IMA
    // version MANJI ZA 1, OD ONOG, KOJI JE
    // DOSAO SA EVENTOM
    const ticket = await Ticket.findOne({ _id: id, version: version - 1 });

    // NARAVNO, AKO SE TICKET NE PRONADJE THROW-UJEMO ERROR
    // STO SMO I RANIJE DEFINISALI
    if (!ticket) {
      throw new Error("ticket not found");
    }

    // SAMO DA TI KAZEM
    // DA SI OVO
    // ticket.set("title", title);
    // ticket.set("price", price);
    // ticket.set("userId", userId);
    // MOGAO I OVAKO NAPISATI

    ticket.set({
      title,
      price,
    });

    // A KADA SE OVO DESI, version NUMBER REPLICATED TICKET-A
    // BICE INCREMENTED ZA 1
    await ticket.save();

    msg.ack();
  }
}
```

# MOZEMO DA REBUILD-UJEMO POD, POKRETANJEM SKAFFOLD-A 

- `skaffold dev`

## TESTIRACEMO THE MANUAL WAY INSIDE INSOMIA-I

PRVO CEMO KREIRATI JEDAN TICKET

`"POST"` `https://microticket.com/api/tickets/`

BODY:

```json
{
	"title": "Mastodon",
	"price": 69
}
```

DATA:

```json
{
  "title": "Mastodon",
  "price": 69,
  "userId": "608089c4eedc6e0018ea6301",
  "version": 0,
  "id": "60941872ae0a3d001845fffe"
}
```

UPDATE-OVACU GORNJI TICKET

```json
{
  "title": "Mastodon",
  "price": 666666666666,
  "userId": "608089c4eedc6e0018ea6301",
  "version": 1,
  "id": "60941872ae0a3d001845fffe"
}
```

**SADA IDE BITAN DEO**

**KREIRACU JEDAN ORDER**

`"POST"` ``

BODY:

```json
{
	"ticketId": "60941872ae0a3d001845fffe"
}
```

DATA:

```json
{
  "status": "created",
  "ticket": "60941872ae0a3d001845fffe",
  "userId": "608089c4eedc6e0018ea6301",
  "expiresAt": "2021-05-06T16:45:51.273Z",
  "version": 0,
  "id": "609419bb3699bf00184b1722"
}
```

**ZELIM DA UZMEM GORNJI ORDER ,A POSTO SAM DEFINISAO populete, KADA TO RADIM; TREBALO BI DA U DOBIJENOM ORDERU DOBIJEM I POPULATED TICKET FIELD**

AKO `version` NA REPLICATED TICKETU BUDE `1` ZNAS DA SAM USPESNO DEFINISAO SVE VEZANO ZA EVENTOVE

`"GET"` `https://microticket.com/api/orders/609419bb3699bf00184b1722`

DATA:

```js
{
  "status": "created",
  "ticket": {
    "title": "Mastodon",
    "price": 666666666666,
    // I BIO SAM U PRAVU
    "version": 1, // version JE ZAISTA 1
    "id": "60941872ae0a3d001845fffe"
  },
  "userId": "608089c4eedc6e0018ea6301",
  "expiresAt": "2021-05-06T16:45:51.273Z",
  "version": 0,
  "id": "609419bb3699bf00184b1722"
}
```

**STO ZNACI DA JE orders SERVICE USPESNO LISTEN-OVAO NA EVENT IZ KANALA `"ticket: updated"`, I DA JE REPLICATED DATA USPESNO UPDAT-OVAO I SVOJ `version`**
