# DELAYING JOB PROCESSING

DAKLE MI CEMO SADA U onMessage HANDLERU KORISTITI `expiresAt` PROPERTI EVENT, KOJI JE ISOS STRING, I KOJI POKAZUJE VREME OD 15 MINUTA U BUDUCNOST; A TO CEMO KORISTITI **KAKO BISMO REKLI `Queue` INSTANCI, ODNOSNO `expirationQueue`-U, KAKO DA DELAY-UJE PROCESSING, JOBA, KOJI TREBA DA ENQUEUE-UJE, ODNONO PUBLISH-UJE DO REDIS SERVER-A**

NAIME, `Queue.add` FUNKCIJA MOZE IMATI I DRUGI ARGUMENT, I TO JE OPTIONS OBJECT

- `code expiration/src/events/listeners/order-created-listener.ts`

```ts
import { Stan, Message } from "node-nats-streaming";
import {
  Listener,
  OrderCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";
import { expiration_microservice } from "../queue_groups";
import { expirationQueue } from "../../queues/expiration-queue";

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
    const { id: orderId, expiresAt } = parsedData;

    // PRVO DA TI KAZEM DA CE NAM TREBATI MILISECONDS
    // OD CURRENT TIME-A DO TIME-A, KOJI PREDSTAVLJA expiresAt

    const delay = new Date(expiresAt).getTime() - new Date().getTime();

    // EVO DODAO SAM I DRUGI ARGUMENT, A TO JE OPTIONS OBJECT
    await expirationQueue.add(
      { orderId },
      {
        // OVO JE PROPERTI KOJI PREDSTAVLJA AMOUNT OF MILISECONDS
        // KOJI CE BITI DELAY, OD KOJEG CE SE POSLATI
        // GORNJI JOB OBJECT, DO REDIS SERVER-A
        // MEDJUTIM, HAJDE DA ZADAMO SAMO 10 SEKUNDI U CILJU TESTIRANJA
        delay: 10 * 1000,
      }
    );

    msg.ack();
  }
}

```

POKRENI SKAFFOLD, AKO TI VEC NIJE POKRENUT (`skaffold dev`)

DAKLE ZELIM DA OVO TESTIRAM U INSOMNII

SADA CEMO DA KREIRAMO ORDER ZA ODREDJENIM TICKET (NECU TI POKAZIVATI, KAKO SE KREIRA TICKET I OSTALI, JER POKAZAO SAM TI TO MNOGO PUTA, A NAJSVEZIJE JE STO SA TI TO POKAZAO U PREDHODNOM BRANCH-U, TAKO DA ZNAS)

`"POST"` ``
