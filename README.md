# BUILDING LISTENER FOR `"ticket:created"`

- `mkdir orders/src/events/listeners`

- `touch orders/src/events/listeners/ticket-created-listener.ts`

```ts
import {
  Listener,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";

export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  channelName: CNE.ticket_created;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_created;
    this.queueGroupName = "orders-microservice";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  async onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    const { id, title, price, userId } = parsedData;

    //
    // OVDE DAKLE DEFINISES STORING TICKET-A U DATBASE orders MICROSERVIC-E
    // DAKLE PRAVIMO DATA REPLICATION, JER SAVE-UJEMO TICKET U LOKALNOJ MONGODB INSTANCI orders MICROSERVICE
    // RANIJE SMO GOVORILI O DATA REPLICATIONSU
    await Ticket.create({
      id,
      title,
      price,
      userId,
    });

    // A OVDE MORAM DEFINISATI ACKNOLADGE

    msg.ack();
  }
}
```

## REMINDER ON QUEUE GROUP

DAKLE ,U SLUCAJU DA SI SCALE-OVAO MICROSERVICE HORIZONTALNO, IMAS DVE INSTANCE MICROSERVICE-A KOJE SLUSAJU NA JEDNU QUEUE GROUPU

ILI, U SLUCAJU DA IMAS POTPUNO ODVOJENE MICROSERVICE-E KOJI SLLUSAJU NA ISTU QUEUE GROUP-U

TADA

**EVENT CE BITI POSLAT SAMO JEDNOM LISTENERU, OD SVIH, KOJI SLUSAJU NA QUEUE GROUP-E U ODREDJENOM KANALU**

**POGOTOVO,  USLUCAJU HORIZONTALNOG SCALING-A, KADA IMAS VISE INSTANCI JEDNOG MICROSERVICE-A, OVO CE OSIGURATI DA SE EVENT SALJE SAMO JEDNOJ OD INSTANCI MICROSERVICE-A**

## REMINDER ON `msg.ack`

**ACKNOWLEDGMENT**

DA EVENT-A, NATS NE POKUSAVA DA REDELEVER-UJE DO DRUGOG LISTENERA, JER SAM MU DAO SIGNAL DA JE EVENT PROCESSED

JER AKO NEMA SIGNALA NAZAD, AKO JE MICROSERVICE CRASH-OVAO, ILI TIMEOUT-OVAO, NATS CE POKUSATI REDELIVERING, NAKON ODREDJENOG VRMENA (KOJE SAM ISTO DEFINISAO KROZ ABSTRACR CLASS Listener)

OVO MU NA MANUELAN NACIN DAJE DO ZNAJA DA NE REDELIVER-UJE ALREADY PROCESSED EVENT

I TAJ MANUELNI NACI NSAM JA ZAHTEVAO (POGLEDAJ [ABSTRACT Listener CLASS](common/src/events/abstr/abstr-listener.ts))

# BOLJE JE NE HARDCODE-OVATI QUEUE GROU NAME, JER MOZE LAKO DOCI DO GRESKE

- `mkdir orders/src/events/queue_groups`

- `touch orders/src/events/queue_groups/index.ts`

```ts
export const orders_microservice = "order-microservice";
```

I SADA CU D KORISTIM GORNJU KONSTANTU

- `code orders/src/events/listeners/ticket-created-listener.ts`

```ts
import {
  Listener,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Message, Stan } from "node-nats-streaming";

import { Ticket } from "../../models/ticket.model";

//
import { orders_microservice } from "../queue_groups";
//

export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  channelName: CNE.ticket_created;
  queueGroupName: string;

  constructor(natsClient: Stan) {
    super(natsClient);

    this.channelName = CNE.ticket_created;
    // EVO DEFINISAO OVAKO
    this.queueGroupName = orders_microservice;

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  async onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    const { id, title, price, userId } = parsedData;

    await Ticket.create({
      id,
      title,
      price,
      userId,
    });

    msg.ack();
  }
}

```

# TEBI SADA OVA IMPLEMTACIJA CUSTOM LISTENER KALSE IZGLEDA STRAIGHT FORWARD

MISLIS DA SADA SAMO POZOVES .listen() I TO JE TO

E PA POSTOJI MNOGO ISSUES O KOJIMO MORAMO GOVORITI

PREDPOSTAVLJAM DA SU TO ISSUES AROUND CONCURRENCY

I DA CEMO MORATI DEFINISATI STORING EVENTOVA, DEFINISUCI I MNEKEKO version
