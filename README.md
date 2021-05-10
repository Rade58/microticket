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
