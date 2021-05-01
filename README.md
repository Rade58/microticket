# Order CREATION LOGIC

- `code orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
// TREBACE MI NEKI CUSTOM ERRORS
import {
  requireAuth,
  validateRequest,
  NotFoundError,
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
// UVESCEMO OBA MODELA
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";
//

const router = Router();

router.get(
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
    // OVO CE JEDINO BITI U BODY-JU
    const { ticketId } = req.body;

    // POTREBNO JE UZETI USER-A

    // OVDE CEMO IMATI USERA ZBOG requireAuth
    // MIDDLEWARE
    // OVO SAMO RADI MZBOG TYPESCRIPT-A
    // MI ZNAMO DA CE USER OVDE BITI ZASIGURNO
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    // PRVO UZIMAMO Ticket DOKUMENT IZ Tickets KOLEKCIJE
    const ticket = await Ticket.findById(ticketId).exec();

    // AKO TICKET NE POSTOJI, MORAMO THROW-OVATI ERROR
    if (!ticket) {
      throw new NotFoundError();
    }

    // SADA CEMO DA VIDIMO STA SVE MORAMO OVDE DA URADIMO

    // - PRE NEGO STO KREIRAM ORDER, MORAMO SE UVERITI DA
    // TICKET NIJE VEC RESERVED (A TO CEMO TAK OSTO CEMO
    // SEARCH-OVATI Orders KOLEKCIJU, PREMA TICKET ID-JU)

    // ONDA MORAMO DA PROVERIMO status


    // - MORAMO DA CALCULATE-UJEMO EXPIRATION DATE ZA ORDER (NA PRIMER 15 min)

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };

```

# FINDING RESERVED TICKETA CE MOZDA BITI MALO CHALLENGING

**MORAMO DA ZNAMO STA TO ZNACI KADA JE NEKI TICKET RESERVED**

PA AKO NE PRONADJES ORDER OBJEKAT, TO ZNACI DA NIJE RESERVED

AKO JE ORDER U `cancelled` STATUSU TO ZNACI DA NIJE RESERVED

DOBRO, KADA TO ZNAM, MOGU DA NASTVIM SA DEFINISANJEM

A SADA CU DA NASTAVIM SA DEFINISANJEM HANDLER-A

- `code orders/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
// TREBACE NAM I ONAJ ENUM ZA status FIELD
// ALI CE NAM TREBATI I ERROR ZA BAD REQUEST
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  OrderStatusEnum as OSE,
  BadRequestError
} from "@ramicktick/common";
import { body } from "express-validator";
import { Types as MongooseTypes } from "mongoose";
import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get(
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
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    const ticket = await Ticket.findById(ticketId).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    // - PRE NEGO STO KREIRAM ORDER, MORAMO SE UVERITI DA
    // TICKET NIJE VEC RESERVED (A TO CEMO TAK OSTO CEMO
    // SEARCH-OVATI Orders KOLEKCIJU, PREMA TICKET ID-JU)

    // ALI DAKLE MI TRAZIMO PREMA status-U KOJI NE SME BITI cancelled

    // AUTOR WORKSHOPA JE OVO ODRADIO DRUGACIJE OD MENE

    const existingOrder = await Order.findOne({
      ticket: ticketId,
      status: {
        // ON JE ZA STATUSOM QUERY-EOVAO OVAKO
        $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
        // JA SAM TO ZELEO OVAKO DA URADIM
        /* $not: [
          OSE.cancelld
        ] */
        // ALI MISLIM DA JE NJEGOV NACIN BOLJI
        // JER MI USTVARI TRAZIMO AKO IMA ORDER
      },
    }).exec();

    // JER AKO IMA ORDER WE WANT TO FINISH EARLY

    // NJEGOV NACIN JE BOLJI JER MOZE ODMAH DA THROW-UJE ERROR
    // OVAKO
    if (existingOrder) {
      // I THROW-UJEMO BadRequestError
      throw new BadRequestError("can't make an order, ticket is already reserved");
    }
    // DALJE CU NASTAVITI KASNIJE

    // - MORAMO DA CALCULATE-UJEMO EXPIRATION DATE ZA ORDER (NA PRIMER 15 min)

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };
```

# MEDJUTIM LOGIKA O TOME DA LI JE TICKET VEC RESERVED, TREBA DA BUDE ENCAPSULATED, KAKO BI JE BILO MOGUCE RESUSE-OVATI U RAZLICITIM HANDLERIMA, ZATO CEMO DEFINISATI JEDNU HELPER FUNKCIJU NA `Ticket` DOKUMENTU

**VEROVATNO SE PITAS ZASTO BI TO URADIO NA Ticket DOKUMENTU, ILI BIL OCEM USTO IMA VEZE SA TICKETOM**, JER SE ZA POMENUTU LOGIKU SEARCH-UJE Orders KOLEKCIJA

PA ZELIM DA POSTIGNM NESTO OVAKO `await TicketDocument.isReserved()` I DA TO RETURN-UJE BOOLEAN

**A NISTA MI NE SMETA DA U FILEU TICKET MODELA, KORSTIM SAMI `Order` MODEL**

***

**IMAJ NA UMU TO DA TI DEFINISES METODU KOJA CE SE KORITITI NA Ticket DOKUMENTU ,KOJI QUERY-UJES IS DATBASE-A, A NE NA `Ticket` MODELU**

JER ZA MODEL TI DEFINISES METODE OVAKO: `schema.statics.imeMetode =`, A ZA DOKUMENT OVAKO `schema.methods.imeMetode =`

***

EVO VIDECES I KAKO

JA CU USTVARI KREIRATI statics METHOD ON SCHEMA

- `code orders/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
// TREBACE I ONAJ STATUS ENUM
import { OrderStatusEnum as OSE } from "@ramicktick/common";
//
// UVOZIM Order MODEL
import { Order } from "./order.model";

// DOLE ISPOD DEFINICIJE SAME SCHEMA-E CU DA PRVO TYPE-UJEM METODU
// PA CU DA JE DEFINISEM

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
      },
    },
  }
);

/**
 * @description this fields are inputs for the document creation
 */
export interface TicketFields {
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for things, among others I can search on obtained document
 */
interface TicketDocumentI extends Document, TicketFields {
  // METODU MOGU DA TYPE-UJEM OVDE
  // EVO OVDE PRVO TYPE-UJEM POMENUTU METODU, KOJA CE SE MOCI NA SCHEME
  // DEFINISATI KROZ methods, I KOJU CE ONDA MOCI MODEL KORISTITI
  isReserved: () => Promise<boolean>; // PROMISE JER CE METODA BITI DEFINISANA KAO async
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // ONLY HERE BECAUSE INTERFACE CAN'T BE EMPTY
  __nothing: () => void;
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING) (can be arrow)
// ticketSchema.statics.__nothing = async function (input) {/**/};
// BUILDING  METHODS ON document ( JUST SHOVING) (can't be arrow)
// ticketSchema.methods.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

// DEFINISEM METODU  isReserved
// METODA NE SME BITI ARROW, JER CU INSIDE, KORITITI
// this KEYWORD

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  // ONU LOGIKU O PROVERI DA LI JE TICKET RESERVED KORISTIMO OVDE

  // ALI PRVO MORAMO UZETI ticketId SA Ticket DOKUMENT-A
  const ticketId = this.id;

  const existingOrder = await Order.findOne({
    ticket: ticketId, // OVDE SI MOGAO STAVITI I SAMO ticket: this
    status: {
      $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
    },
  });

  // SAMO STO SADA KORISTIMO BOOLEAN-E

  if (existingOrder) {
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

## SADA CEMO U NASEM ROUTE HANDLERU DA KORISTIMO GORNJU LOGIKU

- `code `

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

const router = Router();

router.get(
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
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    const ticket = await Ticket.findById(ticketId).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    // UMESTO OVOGA
    /* const existingOrder = await Order.findOne({
      ticket: ticketId,
      status: {
        $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
      },
    }).exec(); */
    // OVO
    const ticketIsReserved = await ticket.isReserved();

    // I UMESTO OVOGA
    // if (existingOrder) {
    // OVO
    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }
    // DALJE CU NASTAVITI KASNIJE

    // - MORAMO DA CALCULATE-UJEMO EXPIRATION DATE ZA ORDER (NA PRIMER 15 min)

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };

```

# MORAMO U HANDLERU KRIRATI EXPIRATION DATE

ALI MORAM OSE ZEZATI SA MILISEKUNDAMA

A ARBITRARY PERIOD EXPIRATIONA JE 15 MINUTA (I ZNAJ DA SVE MORAS DEFINISATI KROZ MILISEKUNDE I JEDAN MSEKUND IMA 100 MILISEKUNDI)

- `code orders/src/routes/new.ts`

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
// import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get(
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
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    const ticket = await Ticket.findById(ticketId).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    // ---- SADA MORAM NAPRAVITI expirationDate
    const expirationDate = new Date(new Date().getTime() + 15 * 60 * 1000);
    // MOZES SE IGRATI U KONZOLI SA OVIM GORE DA VIDIS KAKO SAM DOSAO DO OVOGA
    // OVO GORE JE MOGL ODA SE RADI KROS date.setSeconds(ate.getSeconds + 15 * 60)
    // ALI ME MRZI DA KORISTIM RAZNE METODE NA DATE-U
    // --------------------------------------------------

    
    // DALJE CU NASTAVITI UBRZO

    // - ONDA MOEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };

```

**MEDJUTIM AUTOR WORKSHOPA, JE ZELEO DA TAJ EXPIRATION PERIOD NE BUDE HARDCODED, VEC DA SE REFERENCIRA IZ VARIJABLE (USTVARI KONSTANTE), KOJA BI BILA DEFINSANA ON THe TOP OF THE FILE**

I VREDNOST KOJA BI SE POSTAVLJALA BI BILA U SEKUNDMA

- `code orders/src/routes/new.ts`

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
// import { Order } from "../models/order.model";
import { Ticket } from "../models/ticket.model";

// EVO DEFINISEM COTANTU
const EXPIRATION_PERIOD_SECONDS = 15 * 60; // EVO OVO SADA IMA
//                                          15 min U SEKUNDAMA

const router = Router();

router.get(
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
    let userId: string;
    if (req.currentUser) {
      userId = req.currentUser.id;
    }

    const ticket = await Ticket.findById(ticketId).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    // ---- UMESTO OVOGA
    // const expirationDate = new Date(new Date().getTime() + 15 * 60 * 1000);
    //  -----   OVO
    const expirationDate = new Date(
      new Date().getTime() + EXPIRATION_PERIOD_SECONDS * 1000
    );

    // --------------------------------------------------

    // DALJE CU NASTAVITI UBRZO

    // - ONDA MOZEMO DA NAPRAVIMO, NOVI Order DOKUMENT

    // - MORAMO DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    res.send({});
  }
);

export { router as createNewOrderRouter };
```

OVO JE GOOD ENOUGH, AL ISAM ODA KAZEM DA POMENUTU VARIJABLU NEKI LJUDI KORISTE KAO ENV VARIABLE, ILI JE CAK STORE-UJU U DATABASE-U, KAKO BI NEKI ADMINISTRATOR MOGAO MENJATI TU VREDNOST


# SADA ONACNO MOZEMO DEFINISATI BUILDING NOVOG Order DOKUMENT-A

- `code orders/src/routes/new.ts`

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

// EVO DEFINISEM COTANTU
const EXPIRATION_PERIOD_SECONDS = 15 * 60; // EVO OVO SADA IMA
//                                          15 min U SEKUNDAMA

const router = Router();

router.get(
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

    const ticket = await Ticket.findById(ticketId).exec();

    if (!ticket) {
      throw new NotFoundError();
    }

    const ticketIsReserved = await ticket.isReserved();

    if (ticketIsReserved) {
      throw new BadRequestError(
        "can't make an order, ticket is already reserved"
      );
    }

    const expirationDate = new Date(
      new Date().getTime() + EXPIRATION_PERIOD_SECONDS * 1000
    );

    // KREIRAMO DOKUMENT
    const order = await Order.create({
      ticket: ticket.id,
      userId: userId as string,
      expiresAt: expirationDate,
      status: OSE.created,
    });

    // --------------------------------------------------

    // - OSTAJE DA PUBLISH-UJEMO EVENT (ALI TO TEK NAKON STO UPDATE-UJEMO COMMON MODULE
    // DAKLE MORAMO KREIRATI USTOM EVENT KLASU) (I NAKON STO KREIRAMO CUSTOM PUBLISHERA)

    // ------

    // SADA MOZEMO DA SEND-UJEMO ORDER BACK
    res.status(201).send(order);
  }
);

export { router as createNewOrderRouter };
```
