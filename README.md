# PUBLISHING AN EVENT WHEN JOB IS PROCESSED

JASNO TI JE DA GOVORIMO O PUBLISHINGU U CHANNELL `"expiration:complete"`; LI IZ CALLBACK-A, KOJI JE PASSED KAO ARGUMENT `expirationQueue.process` METODE INSIDE `expiration/src/queues/expiration-queue.ts` FILE

**MEDJUTIM MI CEMO MORATI KREIRATI CUSTOM PUBLISHERA, KAKO BI MOGLI USPENO PUBLISH-OVATI POMENUTI EVENT**

# KREIRAMO `ExpirationCompletePublisher`-A

- `mkdir expiration/src/events/publishers`

- `touch expiration/src/events/publishers/expiration-complete-publisher.ts`

```ts
import {
  Publisher,
  ExpirationCompleteEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { Stan } from "node-nats-streaming";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEventI> {
  channelName: CNE.expiration_complete;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.expiration_complete;

    Object.setPrototypeOf(this, ExpirationCompletePublisher.prototype);
  }
}
```

# SADA CEMO DA KORISTIMO GORNJEG PUBLISHINGA DA PUBLISH-UJEMO EVENT INSIDE PIECE OF CODE, KOJI PROCESS-UJE JOB DOBIJEN OD REDIS SERVER-A

- `code expiration/src/queues/expiration-queue.ts`

```ts
import Queue from "bull";
// UVOZIM POMENUTOG PUBLISHER-A
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
// UVOZIMO I  natsWrapper
import { natsWrapper } from "../events/nats-wrapper";
// ----------------------------------------

interface PayloadI {
  orderId: string;
}

export const expirationQueue = new Queue<PayloadI>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  //
  const { orderId } = job.data;

  // EVO OVDE PUBLISH-UJEMO EVENT

  await new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId,
  });
});

```

# MOZEMO DA NAPRAVIMO JEDAN MANUAL TEST

KREIRAMO TICKET

`"POST"` `https://microticket.com/api/tickets/`

BODY:

```json
{
	"title": "Mastodon",
	"price": 69966
}
```

DATA:

```json
{
  "title": "Mastodon",
  "price": 69966,
  "userId": "609958c18b60a4002370f5ec",
  "version": 0,
  "id": "60999a4dc5d00000199098cd"
}
```

**SADA CU DA ODRADIM NAJBITNIJE, A TO JE DA KREIRAM ORDER**

`"POST"` `https://microticket.com/api/orders/`

BODY:

```json
{
	"ticketId": "60999a4dc5d00000199098cd"
}
```

DATA:

```json
{
  "status": "created",
  "ticket": "60999a4dc5d00000199098cd",
  "userId": "609958c18b60a4002370f5ec",
  "expiresAt": "2021-05-10T20:41:38.201Z",
  "version": 0,
  "id": "60999a6ef52c83001803a4a7"
}
```

**SADA CES IMATI OVAKAV OUTPUT U TERMINALU SKAFFOLD-A** (IZDVAJAM ST JE NAJVAZNIJE)

```zsh
[orders] 
[orders]             Event Published
[orders]             Channel: order:created
[orders]           
[expiration] Mesage received:
[expiration]           subject: order:created
[expiration]           queueGroup: expiration-microservice
[expiration]
```

ONO STO BI TREBALO DA SE DESI JESTE DA SE NAKON 20 SEKUNDI PUBLISH-UJE EVENT `"expiration:complete"` (ZASTO POSLE 20 SEKUNDI PROVERI U PROSLOM BRANCH-U JER SAM O TOME PISAO)

```zsh
[expiration] 
[expiration]             Event Published
[expiration]             Channel: expiration:complete
[expiration]           
```

**KAO STO VIDIS EVENT SE PUBLISH-OVAO NAKON 2O SEKUNDI, JER JE TOLIKO BIO DELAY PODESEN KADA JE expiration QUEUE QUEUE-OVAO JOB DO REDIS-A (A T OSAM TI VEC OBJASNIO U PROSLIM BRANCH-EVIMA)**
