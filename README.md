# OPTIMISTIC CONCURRENCY CONTROL

***
***

digresija 1:

`mongoose-update-if-current` PACKAGE KOJI AUTOR WORKSHOPA KORISTI, JA NECU KORISTITI, JER JE MOGUCE ONO STO OVAJ PAKET NUDI PODESITI, KROZ PAR OPCIJA U SCHEMA-I

***
***

JA NAIME ZELIM DA POSTIGNEM TRI STVARI

1. DA KADA DOBIJEM DOKUMENT DA ONAJ `__v` FIELD DOBIJEM POD NEKIM DRUGIM IMENOM, NA PRIMER VERSION

2. I ZELIM DA SE TAJ FIELD INCREMENTIR, NAKON UPDATE-A DOKUMENTA

3. **DA SE THOW-UJE ERROR U OVOM SCENARIJU**: AKO QUERY-UJES JEDAN DOKUMENT DVA PUTA, TAKO DA IMAS DVE INSTANCE ISTOG DOKUMENTA, ONDA POKSAS DA UPDATE-UJEES JEDNU INSTANCU DOKUMENTA, **ALI PRI UPDATINGU DRUGE INSTANCE, TREBAO BI DA IMAS ERROR** (I OVDE POZIVANJE `MongooseDocument.save()` TREB DA ODIGRA ODLUCUJUCU ULOGU) (ZA BOLJE OBJASNJENJE OVOGA, POGLEDAJ POSLEDNJI NASLOV OVOG BRANCH-A)

***
***

MEDJUTIM IMAM `NEKOLIKO PROBLEMA, KOJE SAM JA PROUZROKOVAO`, KORISTECI METODE ZA UPDATING DOKUMENTA, ZA KOJE SE NE MOZE PODESITI DA SE NAKON NJIHOVE UPOTREBE version, USTVARI INCREMNTIRA

**NAKON STO POPRAVIM POMENUTO, PODESICU PAR OPCIJA ZA SCHEMA-E, KAKO BI MOGAO POSTICI DVE GORE POMENUTE STVARI**

## SVUGDE GDE SAM KORISTIO `model.findOneAndUpdate`, JA CU KORISTITI, USTVARI `Document.set()` I `await Document.save()`

**TO JE ZATO STO SE INCRMENTING versin-A MOZE JEDINO OBAVLJATI, KADA SE POZIVA `.save()`**

URADICU TO U SVIM MICROSERVICE-OVIMA, GDE SAM KORISTIO UPDATING DOKUMENTA

- `code tickets/src/routes/update.ts`

```ts
import { Router, Request, Response } from "express";
import {
  NotAuthorizedError,
  NotFoundError,
  validateRequest,
  requireAuth,
} from "@ramicktick/common";

import { body } from "express-validator";

import { Ticket } from "../models/ticket.model";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../events/nats-wrapper";

const router = Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title")
      .isString()
      .not()
      .isEmpty()
      .withMessage("title has invalid format"),
    body("price").isFloat({ gt: 0 }).withMessage("price has invalid format"),
  ],

  validateRequest,

  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.currentUser?.id;
    const { title, price } = req.body;

    const data: { title?: string; price?: number } = {};

    if (title) {
      data["title"] = title;
    }
    if (price) {
      data["price"] = price;
    }

    const ticket = await Ticket.findById(id).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.userId !== userId) {
      throw new NotAuthorizedError();
    }

    // UMESTO OVOGA
    /* ticket = await Ticket.findOneAndUpdate(
      { _id: id },
      { price: data.price, title: data.title },
      { new: true, useFindAndModify: true }
    ).exec(); */

    // DEFINISEM OVO
    if (data["title"]) {
      ticket.set("title", data.title);
    }
    if (data["price"]) {
      ticket.set("price", data.price);
    }
    // I OVO
    await ticket.save();

    await new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(201).send(ticket);
  }
);

export { router as updateOneTicketRouter };
```

- `code orders/src/routes/delete.ts`

```ts
import { Router, Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model";

// UVOZIM OVO
import { natsWrapper } from "../events/nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
//

const router = Router();

router.patch(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      throw new BadRequestError("order id is invalid mongodb object id");
    }

    const order = await Order.findOne({ _id: orderId })
      // .populate("ticket")
      .exec();

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    // UMESTO OVOGA
    /* order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: OSE.cancelld },
      { new: true, useFindAndModify: true }
    )
      .populate("ticket")
      .exec(); */
    // DEFINISEM OVO
    order.set("status", OSE.cancelled);

    // I DEFINISEM OVO
    await order.save();
    // I OVO
    await order.populate("ticket").execPopulate();

    await new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(200).send(order);
  }
);

export { router as deleteSingleOrderRouter };
```

# SADA CU DA REDEFINISEM SVE MODELE, U SVAKOM OD MICROSERVICE-A, KOJE IMAM; TAKO STO CU NA SCHEMA-E ZADATI SLEDECA DVA FIELD-A: `optimisicConcurrency: true` I `versionKey: "version"`

DAKLE UZ POMOC PRVOG FIELD-A SE POSTIZE INCREMENTING VERSIONA, PRI UPDATING-U

UZ POMOC DRUGOG FIELDDA SE REWRITE-UJE `__v` DA SE ZOVE KAKO JA HOCU, A JA SAM IZBRAO IME `version`

- `code tickets/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";

// EVO POGLEDAJ OPTIONS ARGUMENT SCHEMA-E, UPRAVO
// SE TU PODESAVAJU POMENUTE STVARI
const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      /**
       * @param ret object to be returned later as json
       */
      transform(doc, ret, options) {
        ret.id = ret._id;

        delete ret._id;
        delete ret.__v;
      },
    },
    // EVO DEFINISAO SAM POMENUTE OPCIJE
    // ONO STO JOS TREBAS DEFINISATI JESTE TYPESCRIPT
    // TYPING ZA version FIELD, POSTO CE I ON BITI
    // SADA NA DOKUMNTU KOJI QUERY-UJES
    optimisticConcurrency: true,
    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  // EVO DODAO SAM version
  version: number;
  //
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for things, among others I can search on obtained document
 */
interface TicketDocumentI extends Document, TicketFields {
  //
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // NECU NISTA DODAVATI, ALI OVDE BI TYPE-OVAO STATICKE METODE KOJE
  // SAMO TI OSTAVLJAM OVO KAO TEMPLATE DEFINISANJA
  __nothing: (input: string) => void; //stavio samo jer moram nesto da dodam, ali ovu metodu necu sigurno definisati
}
// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// ticketSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
```

PROBACU OVO SADA ODMAH DA TESTIRAM U INSOMNII

**DAKLE PRAVIM REQUEST ZA KREIRANJE NOVOG TICKET-A**

`"POST"` `https://microticket.com/api/tickets/`

BODY:

```json
{
	"title": "Mastodon",
	"price": 6969
}
```

DATA:

**KAO STO VIDIS, NAJVAZNIJE DA IMAS SADA FIELD `version`**

```json
{
  "title": "Mastodon",
  "price": 6969,
  "userId": "608089c4eedc6e0018ea6301",
  "version": 0,
  "id": "6091217e386dc20019c7dfcc"
}
```

**SADA PROBAJ DA UPDATE-UJES OVAJ ISTI TICKET, NEKOLIKO PUTA**

`"PUT"` `https://microticket.com/api/tickets/6091217e386dc20019c7dfcc`

BODY:

```json
{
	"title": "Mastodont",
	"price": 666
}
```

DATA:

**KAO STO VIDIS `version` FIELD JE INCRMENTED**

```json
{
  "title": "Mastodont",
  "price": 666,
  "userId": "608089c4eedc6e0018ea6301",
  "version": 1,
  "id": "6091217e386dc20019c7dfcc"
}
```

**I OPET SAM SE IGRAO, PA SAM UPDATE-OVAO, NEKOLIKO PUTA, ISTI TICKET, I `version` JE TOKOM TOGA BIVAO INCREMENTIRAN**

## ALI HAJDE DA ODRADIM KONKRETAN UNIT TESST ZA HANDLER `` ,U KOJEM CU NAPRAVITI ASSERTION, DA `version` FIELD POSTOJI I DA SE INCREMENTIRA KADA UPDATE-UJEM DOKUMENT

- `code tickets/src/routes/__tests__/update.test.ts`

```ts
// ...
// ...

it("'version' field is on Ticket document, and it is being incremented when upating document", async () => {
  const cookie = global.getCookie();

  // CREATING TICKET
  const response = await createTicketResponse();

  expect(response.body.version).toBeDefined();
  expect(response.body.version).toEqual(0);

  const { id } = response.body;

  // UPDATING TICKET FIRST TIME
  const response2 = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "Grendel is home",
      price: 66,
    });

  expect(response2.body.version).toBeDefined();
  // TREBALO BI DA BUDE 1, JER KADA JE KREIRAN DOKUMENT IMA FIELD
  // version S VREDNOSU 0
  // A SAD BI TO TREBAL ODA BUDE INCREMENTED
  expect(response2.body.version).toEqual(1);

  // UPDATING TICKET SECOND TIME
  const response3 = await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({
      title: "Gandalf the purple",
      price: 69,
    });

  expect(response3.body.version).toEqual(2);
});
```

- `cd tickets`

- `yarn test` p `Enter` update `Enter`

TEST JE ZAISTA PROSAO

## SADA DA PODESIM `optimisticConcurrency: true`, `versionKey: "version"` NA SCHEMA-MA I U `orders` MICROSERVICE-U

- `code orders/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

import { Order } from "./order.model";

// DAKLE DOLE U OPTIONSIMAASCHEMA-E SAM DOADO, DV POMENUT OPCIJE

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      /**
       * @param ret object to be returned later as json
       */
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
         delete ret.__v;
      },
    },
    // DODAO SAM OPCIJE
    optimisticConcurrency: true,
    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  // DODAJEM I OVO
  version: number;
  //
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for things, among others I can search on obtained document
 */
export interface TicketDocumentI extends Document, TicketFields {
  isReserved: () => Promise<boolean>; // PROMISE JER CE METODA BITI DEFINISANA KAO async
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // ONLY HERE BECAUSE INTERFACE CAN'T BE EMPTY
  __nothing: () => void;
}

// TEKST OD RANIJE
// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING) (can be arrow)
// ticketSchema.statics.__nothing = async function (input) {/**/};
// BUILDING  METHODS ON document ( JUST SHOVING) (can't be arrow)
// ticketSchema.methods.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const ticketId = this.id;

  const order = await Order.findOne({
    ticket: ticketId,
    status: {
      $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
    },
  });

  if (order) {
    return true;
  }

  return false;
};

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
```

- `code orders/src/models/order.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { TicketDocumentI } from "./ticket.model";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

const { ObjectId, Date: MongooseDate } = Schema.Types;

// EVO POGLEDAJ OPTIONS ARGUMENT SCHEMA-E, UPRAVO
// SE TU PODESAVAJU POMENUTE STVARI
const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OSE),
      default: OSE.created,
      required: true,
    },
    expiresAt: {
      type: MongooseDate,
    },
    ticket: {
      type: ObjectId,
      ref: "Ticket",
      required: true,
    },
  },
  {
    toJSON: {
      /**
       *
       * @param doc
       * @param ret object to be returned later as json
       * @param options
       */
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
    // DODAO I OVO
    optimisticConcurrency: true,
    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface OrderFields {
  // DODAO I OVO
  version: number;
  //
  userId: string;
  status: OSE;
  expiresAt: string;
  ticket: TicketDocumentI;
}

/**
 * @description interface for things, among others, I can search on obtained document
 */
interface OrderDocumentI extends Document, OrderFields {
  //
}

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface OrderModelI extends Model<OrderDocumentI> {
  // NECU NISTA DODAVATI, ALI OVDE BI TYPE-OVAO STATICKE METODE KOJE
  // SAMO TI OSTAVLJAM OVO KAO TEMPLATE DEFINISANJA
  __nothing: (input: string) => void; //stavio samo jer moram nesto da dodam, ali ovu metodu necu sigurno definisati
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// ticketSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

const Order = model<OrderDocumentI, OrderModelI>("Order", orderSchema);

export { Order };
```

## ZELIM DA TESTIRAM DA LI CE SE `version` FIELD POSTOJATI NA MONGODB DOKUMANTIMA IZ `orders` MICROSERVICE-A I DA LI CE SE INCREMENTIRATI TOKOM UPDATING-A

- `code orders/src/routes/__test__/delete.test.ts`

```ts
it("'version' field is on Ticket document and Order document; and it is being incremented when upating document", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(1);

  const orderIds = await createOrders(ticketIds, 1, cookie);

  // CANCELLING

  const response = await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  expect(response.body.version).toBeDefined();
  // 1 ZATO TO JE PRI KREIRANJU BILO 0, A UPDATINGOM JE POSTALO 1
  expect(response.body.version).toEqual(1);

  const order = await Order.findOne({ _id: orderIds[0] });

  if (order) {
    order.set("status", OSE.awaiting_payment);
    await order.save();

    // OVD BI TEBAL ODA BUDE 2
    expect(order.version).toEqual(2);
  }

  const ticket = await Ticket.findOne({ _id: ticketIds[0] });

  // SAD PROVERAVAMO version I ZA Ticket DOKUMENT
  if (ticket) {
    expect(ticket.version).toBeDefined();
    expect(ticket.version).toEqual(0);

    ticket.set("price", 208);

    await ticket.save();

    expect(ticket.version).toEqual(1);

    ticket.set("title", "Tool is the band");

    await ticket.save();

    expect(ticket.version).toEqual(2);
  }
});
```

- `cd orders`

- `yarn test` p `Enter` delete `Enter`

I TEST JE PROSAO

# MEDJUTIM SVI GORNJI TESTOVI NISU DOVOLJNI; JER TI SI IH OBAVLJAO, NE UZIMAJUCI UOSTE NEKE MOGUCE PROBLEME KOJE MOGU NASTATI, A VEZANI SU ZA CONCURRENCY, VEC SI TI SAMO TESTIRAO `version` INCRMENTATION

NAJBOLJE BI BILO PRVO DA TI PREDSTAVIM STA BI BIO PROBLEM

TI FETCH-UJES, ODNOSNO QUERY-UJES ZA JEDNIM DOKUMNTOM, DVA PUTA, **ODNOSNO MOZES ZAMISLITI SITUACIJU U KOJOJ SE DESAVA CONCURRENCY PROBLEM, SA NA PRIMER DVE INSTANCE ISTOG MICROSERVICE-A; KOJE SU OBE QUERY-EOVALE ISTI DOKUMENT IZ DATBASE-A, I POKUSAVAJU DA GA UPDATE-UJEU**

**KRUCIJALNO CE BITI POZIVANJE `save()`-A U OVOM SLUCAJU; ONAJ PRVI save() KOJI SE DOGODI BI TREBAO DA USPESNO UPDATE-UJE DOKUMENT, ALI DRUGI SAVE BI TREBALO DA THROW-UJE ERROR IL IDA FAIL-UJE**

JOS NISAM SIGURAN DA LI TO TREBA DA THROW-UJE ERROOR, ILI DA SE UPDATE NE DOGODI, ODNOSNO STA JE ONA OPCIJA optimisticConcurrency OMOGUCILA U OVOM SLUCAJU

**EVO NAPISACU POTPUNO NOVI TEST ZA OVO, A TESTIRACU Tickets, FROM `tickets` MICROSERVICE**

- `mkdir tickets/src/models/__test__`

- `touch tickets/src/models/__test__/ticket.model.test.ts`



digresija 2:

**U OVOM BRANCH-U, JA SAM POPRILICNO TESTIRAO MODELE, ODNOSNO QUERY-ING U DATABASE, ALI SAM JA TO SVE OBAVLJAO U ONIM TEST FILE-OVIMA KOJE SAM, VEC IMAO, A KOJI SU NAMENJENI TESTIRANJU HANDLER-A**, TO SAM RADIO U CLILJ USTEDE VREMENA, `A CAK JE BILO I VEOM CONVINIENT DA TO URADIM`

MEDJUTIM NEKA JE PRAKSA DA SE NAPRAVI `__test__` U FOLDERU GDE SU MONGOOSE MODELI PA DA SE TAMO TESTIRA, VEZANO

MEDJUTIM JA NE VIDIM DA JE NESTO BILO PROBLEMATICNO TO STO SAM JA ODLUCIO DA TESTIRAM MODELE U TEESTOVIMA KOJE SAM NAMENIO ZA TESTIRANJE ROUTE HANDLER-A

DA SE SAD VRATIM NA TEMU OVOG BRANCH-A
