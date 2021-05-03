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

DAKLE AKO SI SCALE-OVAO MICROSERVICE HORIZONTALNO, IMAS DVE INSTANCE MICROSERVICE-A KOJE SLUSAJU NA JEDNU QUEUE GROUPU

ILI IMAS POTPUNO ODVOJENE MICROSERVICE-E KOJI SLLUSAJU NA ISTU QUEUE GROUP-U

TADA

**EVENT CE BITI POSLAT SAMO JEDNOM LISTENERU IZ TE QUEUE GROUP-E**

**POGOTOVO AKO IMAS VISE INSTANCI JEDNOG MICROSERVICE-A, OVO CE OSIGURATI DA SE EVENT SALJE SAMO JEDNOJ OD INSTANCI MICROSERVICE-A**

## REMINDER ON `msg.ack`

ACKNOLEDGMENT

DA OVAJ EVENT NATS NE POKUSAVA DA DELEVER-UJE DO DRUGOG LISTENERA, JER SAM MU DAO SIGNAL DA JE EVENT PROCESSED 

JER AKO NEMA SIGNALA NAZAD, AKO JE MICROSERVICE CRACH-OVAO, ILI TIMEOUT-OVAO, NATS CE POKUSATI REDELIVERING, NAKON ODREDJENOG VRMENA

OVO MU NA MANUELAN NACIN DAJE DO ZNAJA DA NE REDELIVER-UJE ALREADY PROCESSED EVENT

# BOLJE JE NE HARDCODE-OVATI QUEUE GROU NAME
