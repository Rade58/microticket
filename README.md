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
        // DALI ARBITRARY DELAY OD 10 SEKUNDI
      }
    );

    msg.ack();
  }
}

```

POKRENI SKAFFOLD, AKO TI VEC NIJE POKRENUT (`skaffold dev`)

DAKLE ZELIM DA OVO TESTIRAM U INSOMNII

SADA CEMO DA KREIRAMO ORDER ZA ODREDJENIM TICKET (NECU TI POKAZIVATI, KAKO SE KREIRA TICKET I OSTALI, JER POKAZAO SAM TI TO MNOGO PUTA, A NAJSVEZIJE JE STO SA TI TO POKAZAO U PREDHODNOM BRANCH-U, TAKO DA ZNAS)

`"POST"` `https://microticket.com/api/orders/`

BODY:

```json
{
	"ticketId": "609970d2c52d2700185f48de"
}
```

USPESN OSAM NAPRAVIO ORDER, EVO JE ORDER DATA

```json
{
  "status": "created",
  "ticket": "609970d2c52d2700185f48de",
  "userId": "609958c18b60a4002370f5ec",
  "expiresAt": "2021-05-10T17:59:07.239Z",
  "version": 0,
  "id": "609970e73ff22700193c3066"
}
```

**SADA STO JE NAJVAZNIJE JESTE DA ODMAH POCNES DA POSMATRAS SKAFFOLD TERMINAL**

PRVO STO SAM UOCIO JE OVO

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

**E SADA NAKON 10 SEKUNDI POJAVILO SE I OVO**

```zsh
[expiration] I want to publish event to 'expiration:complete' channel. Event data --> orderId 609970e73ff22700193c3066
```

STO ZNACI DA JE NAKON 10 SEKUNDI JOB STIGAO DO PIECE- OF CODE, KOJI JE DOBIO JOB IZ REDISA, I TAJ PIECE OF CODE JE PROCESS-OVAO JOB

A JASAM UPRAVO U TOM PIECE OF CODE-U ZADAO DA SE STAMAPA, ONO STO SE GORE STAMPALO

# MI CEMO PODESITI DA DELAY IPAK BUDE ONOLIKI VEZAN OZA ONAJ DATE IN FUTURE, KOLIKO I POKAZUJE ONAJ `expiresAt`

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

    // DAKLE VEC SMO PRORACUNALI KOLIKO MILISEKUNDI
    // IMA OD CURRENT TIME DO ONOG TIME KOJI PPOKAZUJE
    // SOME MOMENT IN FUTURE
    const delay = new Date(expiresAt).getTime() - new Date().getTime();

    await expirationQueue.add(
      { orderId },
      {
        // EVO PODESAVAMO OVDE POMENUTI DELAY, KOJI JE
        // KAO STO SMO REKLI, U MILISEKUNDAMA
        delay,
      }
    );

    msg.ack();
  }
}

```

SAD JE DELAY NEKIH 15 MINUTA

I TO MOZES TESTIRATI TAKO STO CES NAPRAVITI ORDER, ALI SADA MORAS CEKATI 15 MINUTA DA SE STAMPA ON OSTO SMO ZADALI

MI SMO ONAJ EXPIRATIO NHARDCODE-OVALI DA 15 MINUTA I TO SMO URADDILI OVDE ,PRI SAMOM PUBLISHINGU EVENT-A, DAKLE U SAMO MHANDLER-U ZA KREIRANJE NOVOG ORDERA

HAJDE DA NAKRATKO TO PROMENIMO NA 10 SEKUNDI I DA ONDA NAPRAVIMO ORDER

- `code  orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum as OSE,
  BadRequestError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";

// EVO OVO JE TO STO MOXZEMO MENJATI
// const EXPIRATION_PERIOD_SECONDS = 15 * 60;
// EVO SADA JE 10 SEKUNDI
const EXPIRATION_PERIOD_SECONDS = 10;

const router = Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .isString()
      .not()
      .isEmpty()
      .custom((input: string) => {
        return MongooseTypes.ObjectId.isValid(input);
      })
      .withMessage("'ticketId' is invalid or not provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const userId = req?.currentUser?.id;
    const ticket = await Ticket.findOne({ _id: ticketId }).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    // I CISTO DA TE PODSETIM TO SE KORISTI OVDE
    // DA BI SE NAPRAVIO DATE KOJI UPUCUJE AT SOME MOMENT IN TIME IN FUTURE
    const expirationDate = new Date(
      new Date().getTime() + EXPIRATION_PERIOD_SECONDS * 1000
    );

    const order = await Order.create({
      ticket: ticket.id,
      userId: userId as string,
      expiresAt: expirationDate,
      status: OSE.created,
    });

    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      //
      expiresAt: new Date(order.expiresAt).toISOString(),
      userId: order.userId,
      status: order.status,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as createNewOrderRouter };
```

MOZES OPET DA NAPRAVIS ORDER

I VIDECES DA CE SE NAKON 10 SEKUNDI STMAPATI ONO STO SI DEFINISAO DA SE STAMPA (ALI MORACES DA NAPRAVIS NOVI TICKET, JER JE ONAJ ZA KOJI SMO NE TAKO DAVNO NAPRAVILI ORDER, ALREDY RESERVED)

USPENO SAM I OVO IZTESTIRAO

`"POST"` `https://microticket.com/api/orders/`

BODY:

```json
{
	"ticketId": "60997b0411aaa50018b33126"
}
```

USPESNO SAM NAPRAVIO ORDER, EVO JE ORDER DATA

```json
{
  "status": "created",
  "ticket": "60997af7cbe18d001823df25",
  "userId": "609958c18b60a4002370f5ec",
  "expiresAt": "2021-05-10T18:27:26.574Z",
  "version": 0,
  "id": "60997b0411aaa50018b33126"
}
```

OVO SE ODMAH STMAPALO

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

**A NAKON 10 SEKUNDI I OVO**

```zsh
[expiration] I want to publish event to 'expiration:complete' channel. Event data --> orderId 60997b0411aaa50018b33126
```

DAKLE SVE JE USPESNO TESTIRANO

**TI IPAK VRATI DA ONAJ TIME BUDE IPAK 15 MINUTA** (OPET TI NAPOMINJEM DA TO PODESAVAS INSIDE `orders/src/routes/new.ts`)

## U SLEDECEM BRANCH-U DEFINISACEMO SVE STO TREBA DA BISMO KASNIJE USPENO NAPRAVILI `ExpirationCompletePublisher`-A ,A TAKODJE I `ExpirationCompleteListener`-A 

STO ZNACI DA CEMO OPET MORATI KORISTITI NAS `common` LIBRARY

A PUBLISHERA KADA GA NAPRAVIMO, TREBAMO KORISTITI U ONOM PIECE OF CODE, KOJI PROCESS-UJE JOB POSLAT OD REDIS SERVER-A
