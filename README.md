# ENQUEUING A JOB, ON ARRIVAL OF `"order:created"` EVENT

U PROSLOM BRANCHU SMO NAPRAVILI `Queue` INSTANCU KOJU SMO NAZVALI `expirationQueue`

PODESILI SMO TAKODJE PIECE OF CODE, KOJI PROCESS-UJE JOB, KOJI SALJE REDIS SERVER

**ONO STA CEM OSADA URADITI JESTE QUEUING JOB-A, ONDA KADA PRISTIGNE EVENT IZ KANAL `"order:created"`**

STO ZNACI DA CEMO PISATI CODE INSIDE `onMessage` METODE `OrderCreatedListener` INSTANCE

- `code expiration/src/events/listeners/order-created-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { expiration_microservice } from "../queue_groups";

// UVESCEMO queue INSTANCU
import { expirationQueue } from "../../queues/expiration-queue";
//

export class OrderCreatedListener extends Listener<OrderCreatedEventI> {
  channelName: CNE.order_created;
  queueGroupName: string;

  constructor(stanClent: Stan) {
    super(stanClent);

    this.channelName = CNE.order_created;
    this.queueGroupName = expiration_microservice;

    Object.setPrototypeOf(this, OrderCreatedListener.prototype);
  }

  async onMessage(parsedData: OrderCreatedEventI["data"], msg: Message) {
    // OVDE CEMO SADA DA ENQUEUE JOB
    // I ZNAS DA U NJEM UTREBA BITI orderId KAO DATA
    // ZATO CEMO TO DA UZMEMO, ALI UZECEMO I ISOS DATE STRING
    const { id: orderId, expiresAt } = parsedData;

    // EVO SADA VRSIMO ENQUEUING

    await expirationQueue.add({ orderId });

    // SADA MOZEMO DA ACK-UJEMO OUR MESSAGE
    msg.ack();
  }
}

```

**KAO STO VIDIS MI NISMO NISTA URDILI SA `expiresAt`**

KASNIJE CEMO I TO UPOTREBITI

MEDJUTIM JA SADA ZELIM DA INSTATICIZIRAM LISTENER-A, I DA GA PRIMENIM `listen` NA NJEMU

- `code expiration/src/events/listeners/order-created-listener.ts`

```ts
import { natsWrapper } from "./events/nats-wrapper";
// UVESCU LISTENER
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    // MOGU OVDE DA PODESIM LISTENING ---------------------
    new OrderCreatedListener(natsWrapper.client).listen();
    // ----------------------------------------------------
  } catch (err) {
    console.error(err);
  }
};

start();
```

A ZATIM ZELIM DA NAPRAVIM MANUAL TEST

PRE TOGA NARAVNO DA POKRENEM SKAFFOLD, KAKO BI SE SVE PROMENE APPLY-OVALE NE CLUSTER

- `skaffold dev`

## SADA MOZEMO DA POKRENEMO INSOMNIU I DA NAPRAIMO JEDAN ORDER

ZELIMO DA VIDIMO DA LI CE ONAJ ENQUEUED JOB, STICI EVENTUALLY DO PIECE OF CODE-A, KOJI PROCESS-UJE, POMENUTI JOB (A MI SMO U TOM PIECE-U OF CODE-A KOJI PROCESS-UJE JOB, USTVARI DEFINISALI LOGGING, TAKO DA CEMO SE UVERITI DA SVE FUNKCIONISE AKO SE U SKAFFOLLD TERMINLU DESI TAJ LOGGING)

POSTO SMO RESTARTOVALI CLUSTER, POKRETANJEM SKAFFOLD-A, MI NEMAMO NI USERA NI TICKET, PA MOZEMO PRVO DA KREIRAMO USER-A

`"POST"` `https://microticket.com/api/users/signup` 

BODY:

```json
{"email": "stavros@mail.com",
	"password": "ChillyIsGreat26"
}
```

PA DA KREIRAMO TICKET

`"POST"` `https://microticket.com/api/tickets/`

BODY:

```json
{
	"title": "Mastodon",
	"price": 6999
}
```

DATA:

```json
{
  "title": "Mastodon",
  "price": 6999,
  "userId": "609958c18b60a4002370f5ec",
  "version": 0,
  "id": "609959289061df0018a07ba7"
}
```

**I SADA JE MOMENT OF TRUTH, JER CEMO PRAVITI ORDER ZA GORNJI TICKET**

`"POST"` `https://microticket.com/api/orders/`

BODY:

```json
{
	"ticketId": "609959289061df0018a07ba7"
}
```

**I ZAISTA OVO JE USPELO, JER U SKAFFOLD TERMINALU SI MOGAO VIDETI SLEDECE LOGS**

```zsh
[orders] 
[orders]             Event Published
[orders]             Channel: order:created
[orders]           
[expiration] Mesage received:
[expiration]           subject: order:created
[expiration]           queueGroup: expiration-microservice
[expiration]                  
[expiration] I want to publish event to 'expiration:complete' channel. Event data --> orderId 609959af3272420018444b86
```

## U SLEDECEM BRANCH-U MI CEM OSE POZABAVITI TIME KAKO DA DEFINISEMO DELAY ZA JOB PROCESSING

